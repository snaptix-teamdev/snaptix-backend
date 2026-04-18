# Валидация и Value Objects — Snaptix Backend

---

## Проблема

Без явной стратегии валидация размазывается по всему коду:

- Некоторые проверки в контроллере, некоторые в use case, некоторые нигде
- Невалидные данные могут попасть глубоко в домен или даже в БД
- Правила дублируются: один и тот же регекс для email в gateway и в user-accounts

---

## Архитектура: два рубежа валидации

```
HTTP Request
    │
    ▼
┌─────────────────────────────────────────────┐
│  GATEWAY                                    │
│  ZodValidationPipe (глобальный)             │  ← Рубеж 1: формат
│  Схема из @snaptix/contracts                │    Отсекает мусор до
│  400 Bad Request при ошибке                 │    межсервисного вызова
└──────────────────────┬──────────────────────┘
                       │ валидный запрос
                       ▼
┌─────────────────────────────────────────────┐
│  USER-ACCOUNTS                              │
│  UserEntity.create()                        │  ← Рубеж 2: доменные
│    → UserEmail.create()  ─── UserEmailSchema│    инварианты
│    → Username.create()   ─── UsernameSchema │    Make illegal states
│  DomainValidationError при ошибке           │    unrepresentable
└─────────────────────────────────────────────┘
```

**Единый источник правил:** атомарные Zod-схемы полей (`UserEmailSchema`, `UsernameSchema`) живут в `libs/contracts` и импортируются на обоих уровнях. Правило меняется в одном месте — работает везде.

---

## Принцип Value Object

Value Object (VO) — объект, чья идентичность определяется значением, а не идентификатором.

| Правило                | Что означает                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Валидация при создании | `static create()` бросает ошибку на невалидных данных. Невозможно создать невалидный объект. |
| Иммутабельность        | Созданный объект нельзя изменить. Нужно новое значение — создай новый объект.                |
| Сравнение по значению  | Два `UserEmail("test@mail.com")` равны, даже если это разные экземпляры.                     |
| Без побочных эффектов  | Методы VO не меняют внешнее состояние.                                                       |

> **Make illegal states unrepresentable** — если объект создан, он корректен. Вся валидация — в момент создания.

---

## Разделение ответственности

| Уровень   | Инструмент                        | Что проверяет                                                  |
| --------- | --------------------------------- | -------------------------------------------------------------- |
| Gateway   | Zod + ZodValidationPipe           | Формат полей: email regex, длина username, минимум пароля      |
| Domain VO | Zod (те же схемы) + бизнес-логика | Нормализация + бизнес-правила (блок одноразовых доменов и др.) |

Gateway отсекает **технически невалидные** запросы и экономит трафик между сервисами.
VO защищает **доменные инварианты** — второй рубеж на случай прямых вызовов к микросервису.

---

## Структура файлов

```
libs/contracts/src/
└── user-accounts/
    ├── schemas/
    │   └── register-user.schema.ts   ← Zod-схемы полей и запроса
    └── dto/
        └── register-user.request.dto.ts  ← тип из z.infer<>

apps/
  gateway/src/
    └── main.ts                       ← ZodValidationPipe глобально

  user-accounts/src/modules/users/
    └── domain/
        ├── value-objects/
        │   ├── user-email.vo.ts      ← импортирует UserEmailSchema
        │   ├── username.vo.ts        ← импортирует UsernameSchema
        │   └── index.ts
        └── errors/
            └── domain-validation.error.ts
```

---

## Реализация

### 1. Zod-схемы в `libs/contracts`

```ts
// libs/contracts/src/user-accounts/schemas/register-user.schema.ts
import { z } from 'zod';

// Атомарные схемы полей — импортируются в Value Objects
export const UserEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email format');

export const UsernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username: only letters, digits, underscore');

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');

// Схема HTTP-запроса — используется в gateway
export const RegisterUserRequestSchema = z.object({
  email: UserEmailSchema,
  username: UsernameSchema,
  password: PasswordSchema,
});

export type RegisterUserRequestDto = z.infer<typeof RegisterUserRequestSchema>;
```

> Схема `RegisterUserRequestSchema` собирается из атомарных схем полей. Если меняется правило для email — меняется `UserEmailSchema`, и изменение автоматически применяется и в gateway, и в VO.

---

### 2. Ошибки домена

```ts
// apps/user-accounts/src/modules/users/domain/errors/domain-validation.error.ts
interface DomainError {
  code: string;
  message: string;
  httpCode: number;
}

export class DomainValidationError extends Error {
  public readonly code: string;
  public readonly httpCode: number;

  constructor(error: DomainError) {
    super(error.message);
    this.name = 'DomainValidationError';
    this.code = error.code;
    this.httpCode = error.httpCode;
  }
}
```

```ts
// libs/contracts/src/constants/errors/user-accounts.errors.ts
export const USER_ACCOUNTS_ERRORS = {
  INVALID_EMAIL: {
    code: 'USER_ACCOUNTS.INVALID_EMAIL',
    message: 'Invalid email format',
    httpCode: 400,
  },
  INVALID_USERNAME: {
    code: 'USER_ACCOUNTS.INVALID_USERNAME',
    message: 'Username must be 3–30 characters, only letters/digits/underscore',
    httpCode: 400,
  },
  USER_ALREADY_EXISTS: {
    code: 'USER_ACCOUNTS.USER_ALREADY_EXISTS',
    message: 'User with this email already exists',
    httpCode: 409,
  },
} as const;
```

---

### 3. Value Objects

```ts
// apps/user-accounts/src/modules/users/domain/value-objects/user-email.vo.ts
import { UserEmailSchema } from '@snaptix/contracts';
import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import { DomainValidationError } from '../errors/domain-validation.error';

export class UserEmail {
  private constructor(private readonly _value: string) {}

  static create(raw: string): UserEmail {
    const result = UserEmailSchema.safeParse(raw);

    if (!result.success) {
      throw new DomainValidationError(USER_ACCOUNTS_ERRORS.INVALID_EMAIL);
    }

    // result.data уже нормализован: trim() + toLowerCase() применены Zod
    return new UserEmail(result.data);
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserEmail): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

```ts
// apps/user-accounts/src/modules/users/domain/value-objects/username.vo.ts
import { UsernameSchema } from '@snaptix/contracts';
import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import { DomainValidationError } from '../errors/domain-validation.error';

export class Username {
  private constructor(private readonly _value: string) {}

  static create(raw: string): Username {
    const result = UsernameSchema.safeParse(raw);

    if (!result.success) {
      throw new DomainValidationError(USER_ACCOUNTS_ERRORS.INVALID_USERNAME);
    }

    return new Username(result.data);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Username): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

---

### 4. Интеграция в `UserEntity`

`IUser` в `libs/common` хранит `email: string` — интерфейс остаётся с примитивами, это правильно. VO — деталь домена, а не контракт между сервисами. `UserEntity` использует VO для валидации и нормализации при создании, сохраняя уже нормализованное примитивное значение.

```ts
// apps/user-accounts/src/modules/users/domain/user.entity.ts
import { UserEmail } from './value-objects/user-email.vo';
import { Username } from './value-objects/username.vo';

export class UserEntity implements IUser {
  // ...

  static create(dto: CreateUserDto): UserEntity {
    // Валидация + нормализация через VO
    // Если данные невалидны — DomainValidationError до создания объекта
    const email = UserEmail.create(dto.email);
    const username = Username.create(dto.username);

    const entity = new UserEntity();
    entity.email = email.value;       // сохраняем нормализованное значение
    entity.username = username.value;
    entity.passwordHash = dto.passwordHash;
    entity.deletedAt = null;
    entity.emailConfirmation = UserEmailConfirmationEntity.create();
    entity.recoveryPassword = null;

    return entity;
  }

  static restore(model: IUser): UserEntity {
    // restore() — данные уже прошли валидацию при создании и хранятся в БД.
    // VO не нужны, просто восстанавливаем состояние.
    const entity = new UserEntity();
    Object.assign(entity, { ... });
    return entity;
  }
}
```

> `restore()` намеренно не использует VO — данные из БД уже были валидированы при создании. Повторная валидация излишня и может сломать `restore()` при изменении правил.

---

### 5. Use case: перехват доменных ошибок

```ts
// apps/user-accounts/src/modules/users/application/register-user.usecase.ts
import { DomainValidationError } from '../domain/errors/domain-validation.error';
import { COMMON_ERRORS } from '@snaptix/contracts';

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<
  RegisterUserCommand,
  TResult<RegisterUserCommandResponse>
> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    dto,
  }: RegisterUserCommand): Promise<TResult<RegisterUserCommandResponse>> {
    try {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        return fail(USER_ACCOUNTS_ERRORS.USER_ALREADY_EXISTS);
      }

      // UserEntity.create() вызывает VO внутри.
      // DomainValidationError если данные невалидны.
      const user = UserEntity.create(dto);
      const created = await this.userRepository.create(user);

      return ok({ id: created.id });
    } catch (e) {
      if (e instanceof DomainValidationError) {
        return fail({ code: e.code, message: e.message, httpCode: e.httpCode });
      }
      return fail(COMMON_ERRORS.INTERNAL_ERROR);
    }
  }
}
```

---

### 6. Gateway: глобальная валидация

```ts
// apps/gateway/src/main.ts
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe()); // ← добавить
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
```

```ts
// apps/gateway/src/modules/auth/auth.controller.ts
import { RegisterUserRequestDto } from '@snaptix/contracts';

@Post('register')
async register(@Body() body: RegisterUserRequestDto) {
  // body гарантированно валиден и нормализован ZodValidationPipe
  // email уже lowercase, поля уже trimmed
  return this.commandBus.execute(new RegisterUserCommand(body));
}
```

---

## Поток данных при ошибке

```
POST /auth/register  { email: "INVALID", username: "x", password: "123" }
         │
         ▼ ZodValidationPipe в gateway
         │
         ├─ email невалидный → 400 { errors: [...] }  (запрос не ушёл дальше)
         │
         ▼ если email прошёл, но username слишком короткий
         │
         └─ username невалидный → 400 { errors: [...] }  (запрос не ушёл дальше)


POST /auth/register  { email: "user@mail.com", username: "john_doe", password: "secret123" }
         │
         ▼ ZodValidationPipe → OK, данные нормализованы
         │
         ▼ RegisterUserUseCase.execute()
         │
         ▼ UserEntity.create() → UserEmail.create() → Zod safeParse → OK
         │
         ▼ userRepository.create() → БД
         │
         ▼ ok({ id: "..." })
```

---

## Правила для новых Value Objects

При добавлении нового VO в проект:

1. **Атомарная схема поля** — добавь `NewFieldSchema` в `libs/contracts/src/.../schemas/`
2. **VO класс** — создай в `apps/<service>/src/modules/<module>/domain/value-objects/`
3. **Ошибка** — добавь константу в `libs/contracts/src/constants/errors/<service>.errors.ts`
4. **Использование в Entity** — вызывай VO только в `create()`, не в `restore()`
5. **Использование в схеме запроса** — включи атомарную схему в `RequestSchema` для автоматической валидации в gateway

Пример VO для нового поля `phoneNumber`:

```ts
export const PhoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, 'Invalid phone number format');

// В VO:
export class PhoneNumber {
  static create(raw: string): PhoneNumber {
    const result = PhoneNumberSchema.safeParse(raw);
    if (!result.success) throw new DomainValidationError(ERRORS.INVALID_PHONE);
    return new PhoneNumber(result.data);
  }
}
```

---

## Зависимости для установки

```bash
# Zod — схемы валидации
pnpm add zod

# nestjs-zod — интеграция с NestJS (ValidationPipe + Swagger)
pnpm add nestjs-zod
```

> `nestjs-zod` автоматически генерирует Swagger-схемы из Zod-объектов. Это совместимо с уже настроенным плагином `@nestjs/swagger` в `nest-cli.json`.
