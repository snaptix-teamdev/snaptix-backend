# Snaptix Backend

Бэкенд платформы Snaptix: аккаунты и авторизация пользователей, посты с файлами, геоданные, уведомления и биллинг. Это NestJS-монорепозиторий (pnpm) из семи микросервисов. Внешние запросы принимает `gateway`, а сервисы общаются между собой по TCP и через RabbitMQ.

| Сервис          | Что делает                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `gateway`       | REST API для клиентов и Swagger: проверяет JWT и reCAPTCHA, принимает вход через Google и передаёт запросы сервисам по TCP                |
| `user-accounts` | регистрация с подтверждением e-mail, вход по паролю и через Google, восстановление пароля, токены, активные устройства, настройки профиля |
| `posts`         | создание, редактирование и удаление постов, посты пользователя и лента последних постов                                                   |
| `files`         | загрузка файлов в S3 по presigned URL и привязка их к сущностям, например к постам; удаляет файлы при удалении поста                      |
| `geo`           | справочник стран, регионов и городов на русском и английском (GeoNames)                                                                   |
| `notifications` | письма по событиям из RabbitMQ: подтверждение регистрации, сброс и смена пароля                                                           |
| `billing`       | управление платежами и подписками                                                                                                         |

## Требования

- **Node.js 22.** Через [nvm](https://github.com/nvm-sh/nvm): `nvm install` в корне репозитория возьмёт версию из `.nvmrc`. Также можно поставить установщиком с [nodejs.org](https://nodejs.org/).
- **pnpm 10** (в `package.json` указан `pnpm@10.27.0`):
  - любая ОС: `corepack enable pnpm` (Corepack входит в Node.js 22, версию pnpm он возьмёт из `package.json`);
  - macOS и Linux: `curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=10.27.0 sh -`;
  - Windows: `npm install -g pnpm@10.27.0` (pnpm советует npm вместо standalone-скрипта, потому что Microsoft Defender может заблокировать его exe-файл).
- **Docker с Compose v2.** На macOS и Windows — [Docker Desktop](https://www.docker.com/products/docker-desktop/), на Linux — [Docker Engine](https://docs.docker.com/engine/install/) с плагином `docker compose`.
- **GitHub CLI** для загрузки данных geo, см. [установку](scripts/geo/README.md#1-github-cli).

## Быстрый старт

```bash
pnpm install
gh auth login            # один раз
pnpm geo:data:download   # один раз: скачать справочник geo
pnpm geo:import:dev      # один раз: загрузить его в БД
pnpm start:dev:all
```

Swagger: <http://localhost:9000/api/v1/swagger>.

`pnpm docker:stop` останавливает контейнеры и сохраняет данные. `pnpm docker:down` удаляет контейнеры вместе с volumes: все локальные базы очищаются, и `pnpm geo:import:dev` нужно запустить снова. Подробнее про данные geo — в [scripts/geo/README.md](scripts/geo/README.md).

## Переменные окружения

### Где лежат

У каждого сервиса свои файлы в `apps/<service>/`, общего `.env` в корне нет. Сервис читает только файлы из своей папки. Поэтому переменную, которая нужна нескольким сервисам, прописывают в файлах каждого из них: например, `MICROSERVICE_GEO_PORT` есть у `gateway`, `user-accounts` и `geo`.

| Файл                     | В git | Что в нём                                                                                                                                                                                         |
| ------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env.production`        | да    | Шаблон: полный список переменных сервиса с комментариями и примерами. Значения пустые, реальные прод-значения сюда не пишут.                                                                      |
| `.env.development`       | да    | Значения для локальной разработки: адреса контейнеров из `docker-compose.yml`, dev-ключи и заглушки. Файл видят все, у кого есть доступ к репозиторию, поэтому здесь только несекретные значения. |
| `.env.development.local` | нет   | Личные переопределения поверх `.env.development`: настоящие ключи и значения, которые отличаются у конкретного разработчика.                                                                      |
| `.env.test`              | да    | Подхватывается при `NODE_ENV=test`, его выставляет jest. Сейчас пустые.                                                                                                                           |

Кроме `.env.development.local`, `.gitignore` не пускает в git `.env`, `.env.local`, `.env.test.local` и `.env.production.local`.

В `apps/gateway/.env.development` для Google OAuth стоят заглушки, а для reCAPTCHA — публичный тестовый ключ Google, с которым любая проверка проходит. Чтобы работал вход через Google, задайте настоящие `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` в `apps/gateway/.env.development.local`.

### Порядок загрузки

`ConfigModule` в `apps/<service>/src/core/config/config-module.ts` получает список файлов от `envFilePath()` из `libs/common/src/utils/env-file-path.ts`. Если переменная задана в нескольких местах, берётся значение из первого по списку:

1. окружение процесса: shell, `cross-env`, Kubernetes;
2. `.env.${NODE_ENV}.local`;
3. `.env.${NODE_ENV}`;
4. `.env.production`.

Пути считаются от `process.cwd()`, поэтому сервисы и скрипты запускают из корня репозитория.

`NODE_ENV` выставляют сами скрипты: `*:start:dev`, `*:start:debug` и Prisma-скрипты с суффиксом `:dev` задают `development` через `cross-env`. Скрипты `*:start` и `*:prisma:deploy:prod` его не задают, в проде он приходит из Kubernetes. Допустимые значения проверяет `CoreConfig` каждого сервиса: `development`, `staging`, `test`, `production`.

### Prisma CLI

Строку подключения `POSTGRES_<SERVICE>_URL` Prisma берёт из `process.env` в `apps/<service>/prisma/prisma.config.ts`. Файлы сервиса Prisma сама не загружает, поэтому миграции и Studio запускают только через pnpm-скрипты:

- `*:prisma:*:dev` идут через `*:prisma-wrapper:dev`: `cross-env` выставляет `NODE_ENV=development`, а `scripts/prisma/prisma-wrapper.ts` загружает те же файлы, что и сервис, через `envFilePath()` и вызывает `prisma`.
- `*:prisma:deploy:prod` вызывает `prisma` напрямую: в контейнере переменные уже есть в окружении.
- `geo:prisma:reset:prod` запускается с вашей машины через `geo:prisma-wrapper:prod`. Это тот же wrapper, но с `NODE_ENV=production`, поэтому строку подключения он берёт из `apps/geo/.env.production.local`.

Скрипт импорта `geo:import:dev` тоже загружает переменные из `apps/geo/` через `envFilePath()`, поэтому видит ту же БД, что и сервис `geo`.

### Как добавить переменную

1. **Шаблон.** Добавьте ключ в `apps/<service>/.env.production` с пустым значением и комментарием-примером:

   ```dotenv
   # Пример: amqp://username:password@localhost:5672
   RABBITMQ_URI=
   ```

2. **Значение для разработки.** Несекретное значение пишите в `.env.development`, секретное или личное — в `.env.development.local`. Если без секрета сервис не стартует, положите в `.env.development` заглушку.

3. **Config-класс.** Код читает переменные не по месту использования, а через config-класс модуля: `core/config/core.config.ts` или `*.config.ts` рядом с модулем (например, `apps/files/src/infrastructure/s3/s3.config.ts`). Поле описывают декоратором `class-validator` с сообщением `Set Env variable <NAME>, example: ...`, значение читают в конструкторе через `ConfigService`, а в конце конструктора вызывают `configValidationUtility.validateConfig(this)`:

   ```ts
   @Injectable()
   export class CoreConfig {
     @IsNotEmpty({
       message:
         'Set Env variable RABBITMQ_URI, example: amqp://username:password@localhost:5672',
     })
     rabbitmqUri: string;

     constructor(private configService: ConfigService<any, true>) {
       this.rabbitmqUri = this.configService.get('RABBITMQ_URI');

       configValidationUtility.validateConfig(this);
     }
   }
   ```

   Числа приводят через `parseInt`, списки через запятую — через `parseCommaSeparatedStringToArrayUtil`, булевы значения — через `configValidationUtility.convertToBoolean`. Новый config-класс добавляют в `providers` модуля. Если значение не прошло проверку, сервис падает при старте и перечисляет, какие переменные задать.

   В `billing` и в `AuthConfig` сервиса `user-accounts` config-классы написаны на zod. Схема передаётся в `zodConfigValidationUtility(schema)`, та проверяет `process.env`, а свойства класса называются так же, как переменные: `PORT`, `RABBITMQ_URI`. Для типовых переменных в `libs/common` есть готовые схемы с подсказками в тексте ошибки: `envPort`, `envBoolean`, `envNodeEnv`, `envString(example)` и `envList(example)`. Для флагов не используйте `z.coerce.boolean()`: строку `"false"` он превращает в `true`.

4. **Прод.** В `apps/<service>/deployment.yaml` каждая переменная перечислена явно и берётся из Kubernetes Secret через `secretKeyRef` (имя секрета указано там же). Добавьте новую переменную по образцу соседних и заведите ключ в самом секрете. Без этого шага переменная до контейнера не дойдёт.

   `PORT` HTTP-сервисов в `deployment.yaml` нет: его задаёт `Dockerfile` из build-аргумента `port`.

## Лицензия

MIT
