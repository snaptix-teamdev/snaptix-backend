# Структура папки `libs/` — Snaptix Backend

---

## Принцип организации

Каждая библиотека в `libs/` отвечает на один вопрос: **какую роль играет этот код в системе?**

Не «что это синтаксически» (интерфейс, класс, функция), а **зачем это существует**.

Простое правило добавления нового файла:

> Если код используется только в одном сервисе — он живёт внутри `apps/service-name/src/`.
> Если код нужен двум и более сервисам — он переезжает в `libs/`.

---

## Текущие библиотеки проекта

```
libs/
├── common/     ← Чистые утилиты, типы, интерфейсы, абстракции
└── contracts/  ← DTO, события, паттерны для коммуникации между сервисами
```

---

## `common/`

**Роль:** переиспользуемые «кирпичики», не привязанные к фреймворку или инфраструктуре.

**Правило:** этот код можно скопировать в Express-проект или чистый Node.js — и он будет работать без изменений.

**Признаки кода для `common/`:**

- Нет зависимостей от NestJS (`@nestjs/*`)
- Нет зависимостей от конкретной БД или ORM (`@prisma/client`, `typeorm`)
- Используется двумя и более сервисами / модулями
- Чистые функции, типы, интерфейсы, абстрактные классы

**Что внутри:**

| Папка         | Что хранит                                                          | Пример                         |
| ------------- | ------------------------------------------------------------------- | ------------------------------ |
| `interfaces/` | Архитектурные контракты: `IRepository`, `IUseCase`, `IConverter`    | `converter.interface.ts`       |
| `types/`      | Generic-типы: `Nullable<T>`, `Result<T, E>`, `Pagination<T>`        | `nullable.type.ts`             |
| `enums/`      | Enum-ы бизнес-логики, общие для нескольких сервисов                 | `user-role.enum.ts`            |
| `utils/`      | Утилитарные функции: валидация конфигов, работа со строками, датами | `config-validation.utility.ts` |
| `constants/`  | Глобальные константы: регулярные выражения, лимиты                  | `regex.constants.ts`           |
| `errors/`     | Базовые доменные ошибки (не HTTP-исключения)                        | `domain.error.ts`              |

**Пример структуры:**

```
libs/common/src/
├── interfaces/
│   ├── converter/
│   │   └── converter.interface.ts     ← IConverter<Entity, Model>
│   ├── repository.interface.ts        ← IRepository<T>
│   └── use-case.interface.ts          ← IUseCase<Input, Output>
├── types/
│   ├── nullable.type.ts               ← type Nullable<T> = T | null
│   ├── result.type.ts                 ← type Result<T, E = Error>
│   └── pagination.type.ts
├── utils/
│   ├── config-validation.utility.ts   ← validateConfig(), convertToBoolean()
│   └── env-file-path.ts               ← envFilePath() — утилита, не хардкод
├── constants/
│   └── regex.constants.ts
├── errors/
│   └── domain.error.ts
└── index.ts
```

**Что НЕ должно лежать в `common/`:**

- NestJS-модули (`@Module`, `@Injectable`, `@Global`) → в `core/` или внутри сервиса
- Prisma/ORM-специфичный код → внутри сервиса (`apps/service/src/modules/prisma/`) или в отдельной `libs/database/`
- Converter-реализации, завязанные на Prisma (`UniversalConverter` с методами `fromPrismaModelToEntity`) → внутри конкретного сервиса или в `libs/database/`

---

## `contracts/`

**Роль:** описание того, **как сервисы общаются друг с другом**. Протокол коммуникации.

**Правило:** если один сервис отправляет данные, а другой принимает — описание этих данных лежит здесь.

**Признаки кода для `contracts/`:**

- Описывает структуру данных «на границе» сервиса
- Используется и отправителем, и получателем
- Не содержит бизнес-логики — только форму данных
- Классы с декораторами `class-validator` / `class-transformer`, чистые интерфейсы

**Что внутри:**

```
libs/contracts/src/
├── user-accounts/
│   ├── dto/
│   │   ├── create-user.request-dto.ts
│   │   ├── user.response-dto.ts
│   │   └── index.ts
│   ├── events/
│   │   ├── user-created.event.ts
│   │   ├── user-deleted.event.ts
│   │   └── index.ts
│   └── index.ts
├── notifications/
│   ├── dto/
│   └── events/
├── constants/
│   ├── queues.ts      ← имена очередей RabbitMQ / Kafka
│   ├── patterns.ts    ← паттерны сообщений микросервисов
│   └── index.ts
└── index.ts
```

**Пример использования:**

```typescript
// libs/contracts/src/user-accounts/dto/create-user.request-dto.ts
export class CreateUserRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

```typescript
// apps/gateway/src/modules/users/users.controller.ts
import { CreateUserRequestDto } from '@snaptix/contracts/user-accounts';

// apps/user-accounts/src/modules/users/users.service.ts
import { CreateUserRequestDto } from '@snaptix/contracts/user-accounts';
```

---

## `core/` — когда добавлять

**Роль:** NestJS-модули и инфраструктурный код, который импортируется в `AppModule` каждого сервиса.

**Правило добавления:** если один и тот же NestJS-модуль (логгер, конфиг-модуль, health-check) копируется из одного сервиса в другой — пора выносить в `core/`.

**Сейчас** этот код живёт внутри сервисов (`apps/user-accounts/src/common/config/`). Это правильно, пока сервис один. Как только появится второй сервис с теми же потребностями — выносить.

**Что туда попадёт:**

```
libs/core/src/
├── config/
│   └── core-config.module.ts      ← ConfigModule с кастомными настройками
├── logger/
│   ├── logger.module.ts
│   └── logger.service.ts
├── filters/
│   └── all-exceptions.filter.ts   ← Глобальный фильтр ошибок
├── interceptors/
│   ├── logging.interceptor.ts
│   └── timeout.interceptor.ts
└── index.ts
```

---

## `testing/` — когда добавлять

**Роль:** общие инструменты для тестирования, переиспользуемые между сервисами.

**Добавить когда:** появляются одинаковые фабрики тестовых данных или моки сервисов в разных `apps/`.

**Что туда попадёт:**

```
libs/testing/src/
├── factories/
│   └── user.factory.ts            ← Фабрика тестовых пользователей
├── mocks/
│   └── prisma.service.mock.ts     ← Мок PrismaService для unit-тестов
└── helpers/
    └── create-test-app.helper.ts  ← Хелпер для E2E-тестов
```

---

## Итоговая картина

### Сейчас (фактически)

```
libs/
├── common/     ← Чистые утилиты, интерфейсы, типы
└── contracts/  ← DTO и события (пока пустая — наполняется по мере роста)
```

### Целевая структура

```
libs/
├── common/     ← Чистые утилиты, интерфейсы, типы, абстракции
├── contracts/  ← DTO, события, паттерны коммуникации между сервисами
├── core/       ← NestJS-модули: конфиг, логгер, фильтры (добавить при 2+ сервисах)
└── testing/    ← Фабрики, моки, хелперы для тестов (добавить по необходимости)
```

---

## Дерево принятия решений

При добавлении нового файла задай вопросы по порядку:

```
Новый файл
│
├── Используется только в одном сервисе?
│   └── YES → apps/service-name/src/  (не трогай libs/)
│
└── NO (нужен 2+ сервисам)
    │
    ├── Это структура данных для коммуникации между сервисами (DTO, Event, Command)?
    │   └── YES → libs/contracts/
    │
    ├── Это NestJS-модуль (есть @Module, @Injectable, зависит от @nestjs/*)?
    │   └── YES → libs/core/
    │
    ├── Это утилита только для тестов (фабрики, моки)?
    │   └── YES → libs/testing/
    │
    └── Это чистая утилита / тип / интерфейс / абстрактный класс?
        └── YES → libs/common/
```

---

## Сводная таблица

| Библиотека   | NestJS?  | ORM?     | Бизнес-логика? | Когда создавать                                      |
| ------------ | -------- | -------- | -------------- | ---------------------------------------------------- |
| `common/`    | Нет      | Нет      | Нет            | Сразу (уже есть)                                     |
| `contracts/` | Нет      | Нет      | Нет            | Сразу (уже есть)                                     |
| `core/`      | Да       | Нет      | Нет            | Когда инфраструктурный код дублируется в 2+ сервисах |
| `testing/`   | Возможно | Возможно | Нет            | Когда тестовые хелперы дублируются в 2+ сервисах     |

---

## Что НЕ выносить в `libs/`

- **Prisma-схема и миграции** — живут внутри `apps/service-name/prisma/`. У каждого сервиса своя БД и своя схема.
- **Prisma-модуль** (`PrismaModule`, `PrismaService`) — внутри `apps/service-name/src/modules/prisma/`. Если будет несколько сервисов с Prisma — вынести в `libs/database/`.
- **Converter-реализации** (например, `UniversalConverter`) — внутри сервиса, если завязаны на конкретную ORM. Интерфейс (`IConverter`) — в `libs/common/interfaces/`.
- **Бизнес-логика конкретного сервиса** — никогда не в `libs/`, всегда в `apps/`.
