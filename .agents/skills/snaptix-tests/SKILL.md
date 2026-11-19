---
name: snaptix-tests
description: Use BEFORE creating or editing any test file in Snaptix Backend (NestJS-монорепо, jest + ts-jest) — any `*.spec.ts` in apps/* or libs/*, any `*.e2e-spec.ts` or `jest-e2e.json` in apps/*/test, the `jest` section of the root package.json. Load it the moment you are about to write test code, not only when the user literally asks for a test — including when the test is one step of a larger task: a plan option the user picked («вариант с тестом», «+ тест»), «покрой тестом», «с тестами», «проверь тестом», a fix that needs a regression test, a negative control. Also triggers on «напиши тест», «добавь тест», «прогони тесты», «почему падает тест», «тест не находится», "run the tests", code review где надо проверить покрытие или стиль тестов. Captures how to actually RUN the suites (the `pnpm test -- --testPathPattern` form from AGENTS.md finds 0 tests), the gitignored Prisma client that makes specs fail with a misleading TS2339, ts-jest type checking, the broken `@snaptix/*` aliases in e2e configs, per-layer test patterns (Prisma mock, CQRS handler, controller, ClientProxy, exception filters on real HTTP/TCP), English-only test code (no Russian in describe/it names, it.each labels or comments; `should` + infinitive; comments avoided), why each mock lives in its own `jest.Mock` variable (unbound-method), and why `rejects.toThrow(new DomainException(...))` does not check the error code.
version: 0.1.0
---

# Тесты в Snaptix Backend

## Как запускать — читать в первую очередь

Все команды — из корня репозитория. Docker, Postgres и RabbitMQ для юнит-тестов **не нужны**: ни один spec не ходит в базу или брокер.

```bash
pnpm test                      # весь набор: 16 файлов, 104 теста, ~7 с (октябрь 2026)
pnpm test birth-date           # по подстроке пути
pnpm exec jest apps/geo        # то же через jest напрямую
pnpm geo:test                  # все тесты одного сервиса (есть для каждого: <svc>:test)
pnpm exec jest -t 'should return null'   # по подстроке имени теста
pnpm test:cov                  # с покрытием, отчёт в ./coverage
```

### Ловушка: команда из AGENTS.md не находит тесты

```bash
pnpm test -- --testPathPattern=birth-date   # Pattern: --testPathPattern=birth-date - 0 matches
```

pnpm передаёт `--` в jest как есть, и jest принимает весь флаг за шаблон пути. Без `--` работает: `pnpm test --testPathPattern=birth-date`. Короче — позиционный шаблон, как в списке выше.

### Ловушка: TS2339 на PrismaService — это не баг в коде

Каталоги `apps/*/src/generated` в `.gitignore`. В свежем клоне или после правки `schema.prisma` без генерации спеки репозиториев падают так:

```
● Test suite failed to run
  geo.query-repository.ts:12:44 - error TS2339: Property 'countryTranslation' does not exist on type 'PrismaService'.
```

Лечится генерацией клиента для того сервиса, чей тест упал:

```bash
pnpm geo:prisma:generate
```

### ts-jest проверяет типы

Ошибка типов в spec или в коде под тестом роняет весь файл с `Test suite failed to run` — до запуска хоть одного `it`. Это единственная проверка типов для spec-файлов: `tsconfig.app.json` каждого сервиса и `tsconfig.build.json` исключают `**/*spec.ts`, поэтому `tsc -p apps/<svc>/tsconfig.app.json` их не видит.

### e2e — заглушки, и алиасы в них не работают

`apps/*/test/app.e2e-spec.ts` во всех семи сервисах — пятистрочная заглушка с `console.log`. В `apps/*/test/jest-e2e.json` нет `moduleNameMapper`, поэтому импорт из `@snaptix/*` падает с `Cannot find module '@snaptix/common'`.

Без прямой просьбы e2e не пиши. Поведение сервиса проверяется обычным spec через `Test.createTestingModule` (см. «Тесты на настоящем HTTP и TCP»). Если e2e всё-таки нужен, сначала добавь в `jest-e2e.json` этого сервиса маппинг. Пути считаются от `apps/<svc>/test` (проверено на billing):

```json
"moduleNameMapper": {
  "^@snaptix/common(|/.*)$": "<rootDir>/../../../libs/common/src/$1",
  "^@snaptix/contracts(|/.*)$": "<rootDir>/../../../libs/contracts/src/$1",
  "^@snaptix/core(|/.*)$": "<rootDir>/../../../libs/core/src/$1"
}
```

## Где что лежит

Конфиг jest — секция `jest` в корневом `package.json`: `testRegex: .*\.spec\.ts$`, `roots: apps/, libs/`, алиасы `@snaptix/*` через `moduleNameMapper`. Глобальных `clearMocks`/`restoreMocks` нет.

Spec лежит **рядом с файлом, который проверяет**: `geo.query-repository.ts` → `geo.query-repository.spec.ts`. Если у файла несколько тем, вторая тема идёт отдельным файлом с суффиксом: `geo.query-repository.translations.spec.ts`. Каталогов `__tests__` и `tests/` нет.

Что и как тестируется по слоям (образцы — живые файлы, открой ближайший перед тем, как писать):

| Слой                                 | Образец                                                                              | Как собирается                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| хелперы, чистые функции              | `apps/user-accounts/src/accounts/application/helpers/birth-date.helper.spec.ts`      | прямой вызов, без Nest                                 |
| Zod-схемы в contracts                | `libs/contracts/src/schemas/geo.schemas.spec.ts`, `check-geo-exists.payload.spec.ts` | `schema.safeParse(value)`                              |
| query-repository (infrastructure)    | `apps/geo/src/modules/geo/infrastructure/geo.query-repository.spec.ts`               | мок Prisma объектом, `new Repository(prisma)` без Nest |
| Query/Command handler (application)  | `apps/user-accounts/.../deactivate-session-by-id.usecase.spec.ts`                    | `Test.createTestingModule` + `useValue`                |
| контроллер (api)                     | `apps/geo/src/modules/geo/api/geo.controller.spec.ts`                                | мок `QueryBus`, паттерн через `PATTERN_METADATA`       |
| сервис gateway, зовущий микросервисы | `apps/gateway/.../profile-settings-aggregation.service.spec.ts`                      | мок `ClientProxy.send` через `of(...)`                 |
| exception-фильтры, транспорт         | `libs/core/src/exception-filters/microservice.exception-filter.spec.ts`              | настоящее Nest-приложение на порту 0                   |

## Именование

### `it` — префикс `should`

`should` + инфинитив, условие — через `when`:

```ts
it('should return null when user is not found', async () => {
it('should throw SESSION_NOT_FOUND when device does not belong to user', async () => {
it('should not call geo when profile has no location', async () => {
it('should reject value above Postgres integer limit', () => {
it('should make exactly one database query', async () => {
```

Коды ошибок, паттерны и имена полей пишутся как в коде: `USER_NOT_FOUND`, `geo.check-geo-exists`, `{ exists: true }`.

### Русского в тестах нет

Названия `describe` и `it`, описания кейсов в `it.each`, комментарии и пояснения в `eslint-disable` пишутся только по-английски. Кириллица допустима лишь в данных, когда тест проверяет русский текст (см. «Значения в тестах»).

Все 16 spec-файлов на октябрь 2026 года написаны по-русски (`'возвращает null, когда юзера нет'`). Это старый стиль, не копируй его из соседних тестов. Новый тест в таком файле всё равно пишется по-английски. Переводить старые названия попутно не нужно, это отдельная задача.

### `describe` — имя того, что проверяем

```
'CheckGeoExistsQueryHandler'                     ← класс
'GeoQueryRepository.checkGeoExists'              ← класс.метод, когда тест про один метод
'formatBirthDate'                                ← функция
'domain-error.codec'                             ← модуль из чистых функций
'GeoQueryRepository — translations'              ← тема через тире
'GeoSchemas.%s'                                  ← describe.each
```

Вложенные `describe` встречаются редко — для разделов вроде транспорта (`'HTTP'`, `'TCP'`, `'RabbitMQ'`).

### Таблицы кейсов

`it.each` и `describe.each` — с описанием кейса первым элементом, оно подставляется в `%s`:

```ts
it.each([
  ['zero', 0],
  ['negative number', -1],
  ['fractional number', 1.5],
  ['non-numeric string', 'abc'],
])('should reject %s', (_case, value) => {
  expect(parse(value).success).toBe(false);
});
```

Неиспользуемый аргумент — с `_`, eslint это пропускает (`argsIgnorePattern: '^_'`).

## Форма записи

**Только стрелки:** `() =>` и `async () =>`. `async function ()` в репозитории нет.

**Скелет файла** — одинаковый почти везде:

```ts
describe('CheckGeoExistsQueryHandler', () => {
  let handler: CheckGeoExistsQueryHandler;
  let checkGeoExists: jest.Mock;

  const payload = { countryId: 1, regionId: 2, cityId: 3 };

  beforeEach(async () => {
    checkGeoExists = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckGeoExistsQueryHandler,
        { provide: GeoQueryRepository, useValue: { checkGeoExists } },
      ],
    }).compile();

    handler = module.get(CheckGeoExistsQueryHandler);
  });

  it('should return { exists: false } when geo link does not exist', async () => {
    checkGeoExists.mockResolvedValue(false);

    await expect(
      handler.execute(new CheckGeoExistsQuery(payload)),
    ).resolves.toEqual({ exists: false });
  });
});
```

- моки создаются **заново в `beforeEach`**, а не один раз на файл: глобального сброса моков нет;
- фикстуры — `const` на уровне `describe`;
- повторяющийся вызов выносится в короткий хелпер: `const parse = (value: unknown) => schema.safeParse(value)`, `const command = (deviceId: string) => new DeactivateSessionByIdCommand({ ... })`;
- подготовка, действие и проверка разделены пустой строкой.

**Комментариев избегай.** Пояснение переноси в название теста, имя константы или хелпера:

```ts
const MIDNIGHT_UTC = new Date('2000-01-01T00:00:00.000Z');

it('should take date parts in UTC, not in server timezone', () => {
  expect(formatBirthDate(MIDNIGHT_UTC)).toBe('2000-01-01');
});
```

Комментарий оставляй только там, где без него не обойтись, например пояснение в `eslint-disable`. Он пишется в одну строку и по-английски. Блочных комментариев в тестах нет.

## Моки

### Каждый метод — в своей переменной `jest.Mock`

```ts
let findUnique: jest.Mock;
// ...
findUnique = jest.fn();
const prisma = { user: { findUnique } } as unknown as PrismaService;
// ...
expect(findUnique).toHaveBeenCalledWith({
  where: { id: userId, deletedAt: null },
  include: { profile: true },
});
```

Не пиши `expect(prisma.user.findUnique).toHaveBeenCalled()` или `expect(repository.find)`: eslint (`recommendedTypeChecked`) падает с `@typescript-eslint/unbound-method` на любом методе класса, вынутом из объекта. Отдельная переменная это обходит и заодно короче.

### Prisma

Репозиторий создаётся через `new` с объектом-моком, без Nest: так не нужен `PrismaConfig` и база. Мокается только та цепочка, которую дёргает метод:

```ts
const prisma = {
  countryTranslation: { findMany: countryFindMany },
  regionTranslation: { findMany: regionFindMany },
} as unknown as PrismaService;

repository = new GeoQueryRepository(prisma);
```

Проверяется **запрос**, который ушёл в Prisma (`where`, `select`, `include`), и то, что метод сделал с ответом. Тесты с настоящим Postgres в репозитории не пишутся.

### Зависимости через Nest DI

`Test.createTestingModule({ providers: [Тестируемый, { provide: Зависимость, useValue: { метод } }] })`, затем `module.get(Тестируемый)`. Так же подменяются шины:

```ts
providers: [{ provide: QueryBus, useValue: { execute } }];
// ...
expect(execute).toHaveBeenCalledWith(new CheckGeoExistsQuery(payload));
```

### ClientProxy (вызовы микросервисов по TCP)

Токен — `MICROSERVICE_NAME.<СЕРВИС>`, `send` возвращает Observable:

```ts
{
  provide: MICROSERVICE_NAME.GEO,
  useValue: { send: geoSend } as unknown as ClientProxy,
}
// ...
geoSend = jest.fn().mockReturnValue(of(geoLocation));
```

Отказ сервиса по TCP приходит **plain-объектом**, а не `DomainException`. Так его и мокай:

```ts
userAccountsSend.mockReturnValue(
  throwError(() => USER_ACCOUNTS_ERRORS.USER_NOT_FOUND),
);
```

### Logger

Если код под тестом пишет ошибки в лог, заглуши его, чтобы вывод jest не тонул в стеках:

```ts
beforeAll(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
});

afterAll(() => {
  jest.restoreAllMocks();
});
```

Для приложения целиком — `moduleRef.createNestApplication({ logger: false })`.

## Утверждения

| Что проверяем       | Форма                                                    | Сколько в репозитории |
| ------------------- | -------------------------------------------------------- | --------------------- |
| примитив            | `toBe`                                                   | 47                    |
| объект, массив      | `toEqual`                                                | 34                    |
| аргументы вызова    | `toHaveBeenCalledWith`                                   | 16                    |
| «не ходит в …»      | `not.toHaveBeenCalled()`                                 | 6                     |
| null                | `toBeNull()`                                             | 4                     |
| «ровно один запрос» | `toHaveBeenCalledTimes(1)`                               | 2                     |
| часть объекта       | `toMatchObject` — только когда остальное правда не важно | 1                     |

Промисы — через `await expect(...).resolves` / `.rejects`, а не `const result = await ...; expect(result)`, если результат нужен один раз. Обычная ошибка — `rejects.toThrow('db is down')`.

### DomainException: проверяй `getError()`, а не `toThrow`

Jest сравнивает исключения **только по `message`**. Обе формы ниже проходят, даже если брошена ошибка с другим `code`, `httpCode` и `field`, но тем же текстом (проверено):

```ts
await expect(promise).rejects.toThrow(
  new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND),
);
await expect(promise).rejects.toEqual(
  new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND),
);
```

Пиши так, как в `deactivate-session-by-id.usecase.spec.ts`:

```ts
const error: unknown = await useCase
  .execute(command('device-of-another-user'))
  .catch((e: unknown) => e);

expect(error).toBeInstanceOf(DomainException);
expect((error as DomainException).getError()).toEqual(
  USER_ACCOUNTS_ERRORS.SESSION_NOT_FOUND,
);
```

Для `BulkDomainException` `getError()` возвращает `{ isBulk: true, errors: [{ itemId, error }] }`.

Plain-объект ошибки (отказ по TCP) — не `Error`, его можно сравнивать прямо: `rejects.toEqual(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND)`.

Сравнивай с константой из реестра в `@snaptix/contracts` (`COMMON_ERRORS`, `USER_ACCOUNTS_ERRORS`, `POSTS_ERRORS`, `FILES_ERRORS`, `GATEWAY_ERRORS`), а не со строкой `'USER_NOT_FOUND'`. Если реестра для сервиса ещё нет (geo, billing), объяви ошибку константой `IDomainError` в начале spec.

**Не добавляй `resolves.not.toThrow()`.** Он проходит для любого выполненного промиса и ничего не добавляет к `resolves.toEqual(...)` рядом.

## Значения в тестах

Бери значения из предметной области, а не `foo`, `a01`, `test`:

```ts
const userId = '0199b0e8-0000-7000-8000-000000000001';
const profile = {
  firstName: 'Ivan',
  lastName: 'Ivanov',
  aboutMe: 'Backend developer from Minsk',
};
const geoLocation = {
  country: { id: 1, name: 'Belarus' },
  region: { id: 2, name: 'Minsk Region' },
  city: { id: 3, name: 'Minsk' },
};
const payload = { countryId: 1, regionId: 2, cityId: 3 };
```

`userId` — UUID v7, как его генерирует база (`@default(uuid(7))`).

Кириллица в данных допустима только тогда, когда тест проверяет русский текст. Например, выбор перевода по `GeoLang.RU`: `{ lang: GeoLang.RU, name: 'Беларусь' }` рядом с `{ lang: GeoLang.EN, name: 'Belarus' }`. Во всех остальных случаях значения пишутся по-английски.

Подбирай значение так, чтобы оно **само показывало проверяемое свойство**:

| Что проверяем                    | Значение                                             |
| -------------------------------- | ---------------------------------------------------- |
| верхняя граница int4             | `POSTGRES_INT4_MAX + 1` с константой `2_147_483_647` |
| несуществующая дата              | `'1990-02-30'`                                       |
| граница таймзоны                 | `new Date('2000-01-01T00:00:00.000Z')`               |
| перевод не найден, нужен фоллбэк | есть только `{ lang: GeoLang.EN, name: 'Belarus' }`  |
| чужое устройство                 | `'device-of-another-user'`                           |

**Даты** — через UTC: `new Date(Date.UTC(1990, 2, 15))`, а не `new Date(1990, 2, 15)`, иначе тест зависит от таймзоны машины. «Завтра» и «в будущем» считай от текущей даты (`addDays(new Date(), 1)` из `date-fns`), не хардкодь.

## Тесты на настоящем HTTP и TCP

Для фильтров, пайпов и всего, что зависит от транспорта, мок `ArgumentsHost` слабее настоящего приложения. Шаблон — `libs/core/src/exception-filters/microservice.exception-filter.spec.ts` и `apps/gateway/src/core/filters/gateway-exception.filter.spec.ts`:

```ts
const moduleRef = await Test.createTestingModule({
  controllers: [TestController],
}).compile();
const app = moduleRef.createNestApplication({ logger: false });
app.useGlobalFilters(new MicroserviceExceptionFilter());
await app.listen(0, '127.0.0.1');

const { port } = (app.getHttpServer() as Server).address() as AddressInfo;
const response = await axios.get(`http://127.0.0.1:${port}/test/domain`, {
  validateStatus: () => true,
});
```

- порт `0` — свободный порт от ОС, тесты не конфликтуют с запущенными сервисами;
- `validateStatus: () => true` — иначе axios бросит на 4xx/5xx и тело ответа не проверить;
- приведения `as Server` / `as AddressInfo` нужны, иначе eslint ругается правилами `no-unsafe-*`;
- TCP-микросервис: свободный порт через `node:net` (`getFreePort` в том же файле), `app.connectMicroservice(..., { inheritAppConfig: true })` — без этого флага глобальные фильтры и пайпы на микросервис не действуют, так же сделано в `main.ts` сервисов; клиент — `ClientProxyFactory.create(...)`;
- тестовые контроллеры объявляются прямо в spec. Бросить plain-объект, как это делает ClientProxy, можно только с явным отключением правила:

  ```ts
  // eslint-disable-next-line @typescript-eslint/only-throw-error -- ClientProxy rejects with a plain object
  throw SUBSCRIPTION_NOT_FOUND;
  ```

- в `afterAll` закрывай всё, что открыл: `await client.close(); await app.close();`, иначе jest не завершится.

RabbitMQ в spec не поднимается. Поведение для `'rmq'` проверяется фейковым хостом: `{ getType: () => 'rmq' } as unknown as ArgumentsHost`. Проверку на живом брокере делай разовым скриптом вне репозитория. Очереди при этом объявляй durable: RabbitMQ 4 отклоняет временные неэксклюзивные очереди. После проверки удаляй их.

## Что проверять при ревью тестов

**Тест описывает поведение, а не реализацию.** Проверяй то, что видно снаружи: что вернулось, что ушло в Prisma или в другой сервис, какая ошибка брошена. Тест, который повторяет код построчно, ломается на каждом рефакторинге и ничего не ловит.

**Чужие тесты не трогаем.** Приводя стиль к описанному здесь, правь только тесты, которые пишешь или меняешь сам. Пример: `get-profile-settings.query.spec.ts` проверяет ошибку через `rejects.toThrow(new DomainException(...))` — это слабая форма, но переписывать её без просьбы не нужно. Можно упомянуть в отчёте.

**Негативный контроль для регрессов.** Если тест написан под конкретный баг, убедись, что без фикса он падает: временно откати правку, прогони тест, верни правку. Иначе есть риск получить зелёный тест, который ничего не ловит.

**Импорты между сервисами запрещены и в тестах.** eslint (`no-restricted-imports`) не даст импортировать `apps/geo/...` из spec в `apps/gateway`. Общие типы и константы бери из `@snaptix/contracts` и `@snaptix/common`.

## Полная проверка перед сдачей

```bash
pnpm test
```

```bash
pnpm exec eslint <изменённые .ts и .spec.ts>
```

```bash
pnpm exec prettier --check <изменённые файлы>
```

```bash
pnpm exec tsc --noEmit -p apps/<svc>/tsconfig.app.json
```

`tsc` проверяет код сервиса (spec-файлы он не видит, их типы проверил jest). Если правка в `libs/`, прогони `tsc` по всем сервисам: библиотеки общие.

`pnpm lint` для проверки не подходит: он запускается с `--fix` по всему репозиторию и правит чужие файлы. Проверяй своё через `pnpm exec eslint <файлы>`.
