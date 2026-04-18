# Передача идентификатора пользователя из Gateway в микросервисы

## Проблема

После валидации JWT-токена на уровне gateway нижестоящие микросервисы должны знать, кто является пользователем. Существует несколько индустриальных паттернов решения этой задачи.

## 4 паттерна передачи идентификатора

### Паттерн A — Передать оригинальный JWT (Passthrough)

Gateway валидирует токен, но пробрасывает оригинальный `Authorization: Bearer <token>` заголовок в микросервис. Каждый микросервис самостоятельно проверяет подпись через JWKS-эндпоинт IAM.

**Где используется:** Istio, Linkerd (service mesh — sidecar-прокси делает это автоматически).

**Плюсы:** Defense in depth — даже если что-то пройдёт мимо gateway, микросервис отклонит невалидный токен.

**Минусы:** Каждый сервис должен иметь доступ к JWKS; добавляет latency на каждый вызов.

---

### Паттерн B — Внутренний токен (Token Exchange, RFC 8693)

Gateway проверяет внешний токен и выпускает новый короткоживущий внутренний токен. Внутренний токен подписывается симметричным HMAC-ключом (гораздо быстрее RSA). Пробрасывается в заголовке `Authorization` к нижестоящим сервисам.

**Стандарт:** [RFC 8693 — OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693)

**Где используется:** Netflix — самая известная реализация под названием **"Passport"**:

- Protobuf-сериализованный объект с `UserInfo`, `DeviceInfo` и `Integrity`
- Подписан HMAC-SHA256 ключом из Key Management Service
- Никогда не выходит за пределы внутренней сети
- Не зависит от способа аутентификации пользователя — все внутренние сервисы всегда получают одинаковую структуру Passport

**Источник:** [Netflix Tech Blog — Edge Authentication and Token-Agnostic Identity Propagation](https://netflixtechblog.com/edge-authentication-and-token-agnostic-identity-propagation-514e47e0b602)

---

### Паттерн C — Извлечь claims в кастомные заголовки (X-User-Id)

Gateway валидирует JWT, извлекает нужные claims и добавляет их как HTTP-заголовки перед проксированием запроса. Оригинальный токен может быть удалён.

**Где используется:**

**Uber** — явно прописан заголовок `X-User-UUID` в gateway:

- Источник: [Uber — Architecture of Uber's API Gateway](https://www.uber.com/blog/architecture-api-gateway/)

**Kong** — JWT-плагин автоматически добавляет заголовки к каждому upstream-запросу:

| Заголовок                 | Содержимое                     |
| ------------------------- | ------------------------------ |
| `X-Consumer-ID`           | Внутренний ID потребителя Kong |
| `X-Consumer-Username`     | Username потребителя           |
| `X-Credential-Identifier` | Идентификатор JWT-credential   |

**Envoy / Istio** — конфигурируется через `claim_to_headers` в фильтре `jwt_authn`:

```yaml
claim_to_headers:
  - claim_name: sub
    header_name: x-user-id
  - claim_name: email
    header_name: x-user-email
```

**Плюсы:** Просто для нижестоящих сервисов — не нужна JWT-библиотека, достаточно прочитать заголовок.

**Минусы:** Требует mTLS или internal API key. Без этого злоумышленник может подделать `X-User-Id`, отправив запрос напрямую в микросервис в обход gateway.

> **Важно:** Gateway должен принудительно удалять входящие `X-User-Id` заголовки от внешних клиентов, прежде чем добавлять свои.

---

### Паттерн D — Implicit Trust (не рекомендуется)

Gateway проверяет токен, микросервисы принимают запросы без какой-либо проверки. Подходит только для закрытых внутренних сетей с максимальным уровнем доверия.

---

## Применение по типу транспорта

Паттерны A, B, C работают на HTTP/gRPC, где есть заголовки. Выбор паттерна зависит от транспортного протокола между gateway и микросервисами.

| Транспорт                | Рекомендуемый способ   | Комментарий                                      |
| ------------------------ | ---------------------- | ------------------------------------------------ |
| **NestJS TCP** (текущий) | `userId` в payload DTO | Единственный доступный механизм — заголовков нет |
| **HTTP → HTTP**          | `X-User-Id` заголовок  | Паттерн Uber / Kong / Envoy                      |
| **gRPC**                 | gRPC Metadata          | Аналог заголовков в gRPC                         |
| **Service Mesh (Istio)** | Передаётся весь JWT    | Sidecar-прокси проверяет автоматически           |

---

## NestJS TCP: правильная реализация

В NestJS TCP транспорте нет концепции заголовков — только `pattern` и `payload`. Поэтому `userId` включается непосредственно в DTO межсервисного сообщения.

### Контрактный DTO (libs/contracts)

`userId` присутствует в контрактном DTO, так как это поле межсервисного сообщения, а не HTTP-запроса:

```ts
// libs/contracts/src/user-accounts/update-user/update-user.request-dto.ts
export class UpdateUserRequestDto {
  userId: string; // gateway добавляет из токена
  username: string; // из тела HTTP-запроса
  bio?: string; // из тела HTTP-запроса
}
```

### HTTP Body DTO (в gateway)

HTTP Body DTO не содержит `userId` — он не приходит от клиента:

```ts
// apps/gateway/src/.../update-user-body.dto.ts
export class UpdateUserBodyDto {
  username: string;
  bio?: string;
}
```

### Контроллер gateway

Gateway извлекает `userId` из токена и конструирует полный контрактный DTO вручную:

```ts
@Put('me')
@UseGuards(AccessTokenAuthGuard)
updateMe(
  @ExtractUserFromRequest() user: UserContextDTO,
  @Body() body: UpdateUserBodyDto,
): Promise<UpdateUserResponseDto> {
  const payload: UpdateUserRequestDto = { ...body, userId: user.userId };
  return firstValueFrom(
    this.userAccounts.send(USER_ACCOUNTS_PATTERNS.UPDATE_USER, payload),
  );
}
```

Для эндпоинтов без тела запроса (например, `GET /me`) gateway отправляет только `{ userId }`:

```ts
@Get('me')
@UseGuards(AccessTokenAuthGuard)
getMe(@ExtractUserFromRequest() user: UserContextDTO): Promise<GetMeResponseDto> {
  return firstValueFrom(
    this.userAccounts.send(USER_ACCOUNTS_PATTERNS.AUTH.GET_ME, { userId: user.userId }),
  );
}
```

---

## Источники

- [FusionAuth — Tokens at Microservice Boundaries](https://fusionauth.io/articles/tokens/tokens-microservices-boundaries)
- [Netflix Tech Blog — Edge Authentication and Token-Agnostic Identity Propagation](https://netflixtechblog.com/edge-authentication-and-token-agnostic-identity-propagation-514e47e0b602)
- [OWASP — Microservices Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html)
- [Uber — Architecture of Uber's API Gateway](https://www.uber.com/blog/architecture-api-gateway/)
- [Kong JWT Plugin Docs](https://developer.konghq.com/plugins/jwt/)
- [Envoy JWT Authentication Filter Docs](https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/filters/http/jwt_authn/v3/config.proto)
- [RFC 8693 — OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693)
- [Nordic APIs — How To Control User Identity Within Microservices](https://nordicapis.com/how-to-control-user-identity-within-microservices/)
