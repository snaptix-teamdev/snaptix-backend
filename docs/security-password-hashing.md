# Безопасность: хеширование паролей в микросервисной архитектуре

---

## Где хешировать пароль

**Хешировать нужно в `user-accounts`, как можно ближе к моменту записи в БД** — в `RegisterUserUseCase` или выделенном `PasswordService` внутри сервиса.

Gateway **не хеширует пароли**. Его ответственность — маршрутизация и валидация токенов.

Это консенсус OWASP, NIST SP 800-63B и практика крупных компаний (Netflix, Google, Meta, Uber) — все используют выделенный auth/identity сервис, который владеет хешированием.

---

## Почему нельзя хешировать на gateway

Если хешировать на gateway и передавать хеш в `user-accounts`, **хеш становится паролем**. Атакующий, перехвативший хеш, может использовать его напрямую без знания исходного пароля — это задокументированная атака **Pass-the-Hash** (MITRE ATT&CK T1550.002).

Дополнительно это ломает семантику bcrypt/Argon2: `user-accounts` не может добавить свою соль к уже захешированному значению, алгоритм вырождается, защита от offline-cracking пропадает.

---

## Правильный flow

```
Client → [HTTPS] → Gateway → [защищённый канал] → user-accounts
                                                        ↓
                                            RegisterUserUseCase
                                            argon2.hash(dto.password)
                                                        ↓
                                                       DB
```

Команда несёт `password` (plaintext), хеширование происходит внутри `user-accounts`.

---

## Защита при использовании RabbitMQ

### TLS и application-level шифрование — не взаимозаменяемые меры

| Мера                              | Что защищает                                           |
| --------------------------------- | ------------------------------------------------------ |
| **TLS на RabbitMQ**               | Весь транспорт: все поля, метаданные, другие сообщения |
| **Field-level шифрование пароля** | Конкретное поле в случае компрометации брокера         |

Это **AND, не OR**. Field-level шифрование — дополнение к TLS, не замена. Без TLS email, username и другие PII-данные передаются в открытом виде.

### Рекомендуемые меры для RabbitMQ

- **TLS/mTLS на брокере** — обязательно для production
- **Transient messages** — не персистировать auth-сообщения на диск (`deliveryMode: 1`)
- **Короткий TTL** — DLQ не должны накапливать сообщения с credentials
- **Field-level шифрование** — опционально как defence-in-depth поверх TLS

### Альтернатива для операций с паролями

Рассмотреть **синхронный RPC (HTTP/gRPC с mTLS)** для регистрации/аутентификации, и использовать RabbitMQ только для не-чувствительных событий (`UserRegistered`, `EmailVerified` и т.д.) после факта операции.

---

## Рекомендуемые алгоритмы хеширования

По приоритету (OWASP Password Storage Cheat Sheet):

1. **Argon2id** — 19 MiB memory, 2 iterations, 1 parallelism (лучший выбор)
2. **scrypt** — cost `2^17`, block size 8
3. **bcrypt** — cost factor ≥ 10 (ограничение 72 байта на входной пароль)

Никогда: MD5, SHA-1, SHA-256 без соли и cost factor.

---

## Источники

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Microservices Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html)
- [NIST SP 800-63B Digital Identity Guidelines](https://pages.nist.gov/800-63-4/sp800-63b.html)
- [MITRE ATT&CK T1550.002 — Pass the Hash](https://attack.mitre.org/techniques/T1550/002/)
- [RabbitMQ TLS Support](https://www.rabbitmq.com/docs/ssl)
