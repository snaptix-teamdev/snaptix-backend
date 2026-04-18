# Архитектурные правила — Snaptix Backend

---

## Содержание

1. [Слои и направление зависимостей](#1-слои-и-направление-зависимостей)
2. [Зависимости типов в use cases](#2-зависимости-типов-в-use-cases)
3. [Доменные исключения: где бросать](#3-доменные-исключения-где-бросать)
4. [`DomainException` не должен зависеть от фреймворка](#4-domainexception-не-должен-зависеть-от-фреймворка)
5. [Связанность модулей в application layer](#5-связанность-модулей-в-application-layer)
6. [Query-репозиторий vs Repository](#6-query-репозиторий-vs-repository)

---

## 1. Слои и направление зависимостей

### Структура слоёв

Каждый модуль организован по четырём слоям чистой архитектуры:

```
api/            ← HTTP / TCP контроллеры. Принимают запрос, делегируют в CommandBus/QueryBus.
application/    ← Use cases (CommandHandler, QueryHandler). Оркестрируют домен и инфраструктуру.
domain/         ← Сущности, value objects, доменные DTO, бизнес-правила. Без зависимостей на фреймворк.
infrastructure/ ← Репозитории, адаптеры (Prisma, JWT, Crypto). Реализуют интерфейсы домена/application.
converter/      ← Маппинг между доменными сущностями и Prisma-моделями.
```

### Правило зависимостей (Dependency Rule)

Зависимости направлены **только внутрь** — от внешних слоёв к внутренним. Внутренние слои ничего не знают о внешних.

```
api → application → domain
         ↓
   infrastructure
```

Конкретно:

- `domain` — не импортирует ничего из других слоёв. Не знает о NestJS, Prisma, HTTP.
- `application` — импортирует интерфейсы из `domain` и `libs/common`. Не импортирует конкретные классы из `infrastructure`.
- `infrastructure` — импортирует из `domain` и `application`, реализует их интерфейсы.
- `api` — импортирует только из `application` (команды, запросы, DTO).

### Частые нарушения

```ts
// НАРУШЕНИЕ: application layer импортирует конкретный класс инфраструктуры
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';

// ПРАВИЛЬНО: зависимость от интерфейса
import { IUsersQueryRepository } from '../../../users/domain/users-query-repository.interface';
```

```ts
// НАРУШЕНИЕ: domain entity импортирует NestJS
import { RpcException } from '@nestjs/microservices';

// ПРАВИЛЬНО: domain entity знает только о чистых классах из libs/common
import { DomainException } from '@snaptix/common';
```

---

## 2. Зависимости типов в use cases

Use cases должны ссылаться на доменные **интерфейсы** (`IUser`, `ISession` и т.д.), а не на конкретные классы сущностей (`UserEntity`), при объявлении возвращаемых типов и промежуточных переменных.

Конкретные классы используются только для вызова фабричных методов (`Entity.create()`, `Entity.restore()`).

```ts
// ПРАВИЛЬНО — зависимость от интерфейсного контракта
import { IUser } from '@snaptix/common';

type CommandResponse = Pick<IUser, 'id'>;

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<
  RegisterUserCommand,
  CommandResponse
> {
  async execute(command: RegisterUserCommand): Promise<CommandResponse> {
    const user: IUser = UserEntity.create(command); // конкретный класс — только для create/restore
    await this.usersRepository.save(user);
    return { id: user.id };
  }
}
```

```ts
// НЕПРАВИЛЬНО — зависимость от конкретного класса
import { UserEntity } from '../domain/user.entity';

type CommandResponse = Pick<UserEntity, 'id'>; // если UserEntity переименуют — сломается
```

**Почему важно:** application-слой зависит от стабильных абстракций (`libs/common`). При изменении реализации `UserEntity` (добавление методов, переименование) use case остаётся незатронутым. Это принцип инверсии зависимостей (DIP).

---

## 3. Доменные исключения: где бросать

### Теоретическая основа

В чистой архитектуре каждый слой отвечает за **свой уровень знания**:

- **Domain layer** знает бизнес-правила — что является корректным состоянием сущности.
- **Application layer** знает поток выполнения — какие шаги нужно совершить и в каком порядке.
- **Infrastructure layer** знает детали хранения — как читать и писать данные.

Исключение должно бросаться в том слое, который **владеет нарушенным правилом**.

### Правило разграничения

| Вопрос                                            | Где бросать            |
| ------------------------------------------------- | ---------------------- |
| Нарушено состояние самой сущности?                | Сущность (domain)      |
| Запись не найдена в базе данных?                  | Use case (application) |
| Внешний сервис вернул ошибку?                     | Use case (application) |
| Бизнес-правило требует данных из другой сущности? | Use case (application) |

**Тест для разграничения:** "Может ли сущность ответить на этот вопрос сама, не обращаясь к репозиторию или сервису?" — если да, логика и исключение в сущности.

### Доменный инвариант → сущность

Сущность является единственным владельцем своих бизнес-правил. Только она знает, при каких условиях её состояние становится некорректным.

```ts
// UserEntity — ПРАВИЛЬНО
confirmEmail(code: string): void {
  // Инвариант 1: нельзя подтвердить уже подтверждённый email
  if (this.isVerified)
    throw new DomainException(USER_ACCOUNTS_ERRORS.EMAIL_ALREADY_CONFIRMED);

  // Инвариант 2: код не может быть использован после истечения срока
  if (this.isEmailConfirmationCodeExpired())
    throw new DomainException(USER_ACCOUNTS_ERRORS.EMAIL_CONFIRMATION_CODE_EXPIRED);

  // Инвариант 3: код должен совпадать
  if (this.emailConfirmation.code !== code)
    throw new DomainException(USER_ACCOUNTS_ERRORS.INVALID_EMAIL_CONFIRMATION_CODE);

  this.isVerified = true;
}

resetPasswordByRecoveryCode(newPasswordHash: string): void {
  // Инвариант: нельзя сбросить пароль без активного кода восстановления
  if (!this.recoveryPassword)
    throw new DomainException(USER_ACCOUNTS_ERRORS.RECOVERY_PASSWORD_NOT_REQUESTED);

  if (this.isPasswordRecoveryCodeExpired())
    throw new DomainException(USER_ACCOUNTS_ERRORS.RECOVERY_PASSWORD_CODE_EXPIRED);

  this.passwordHash = newPasswordHash;
  this.recoveryPassword = null;
}
```

Use case просто вызывает методы — он не знает деталей валидации, исключение всплывёт само:

```ts
// ConfirmRegistrationUseCase — ПРАВИЛЬНО
async execute(command: ConfirmRegistrationCommand): Promise<void> {
  const user = await this.usersRepository.findByEmailCode(command.code);
  if (!user)
    throw new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND); // оркестрация

  user.confirmEmail(command.code); // инвариант — сущность бросит сама если что-то не так

  await this.usersRepository.update(user);
}
```

Если перенести проверку в use case, он начинает знать внутренности сущности — нарушается инкапсуляция:

```ts
// ConfirmRegistrationUseCase — НЕПРАВИЛЬНО
async execute(command: ConfirmRegistrationCommand): Promise<void> {
  const user = await this.usersRepository.findByEmailCode(command.code);
  if (!user) throw new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND);

  // use case знает о внутренней структуре сущности — нарушение инкапсуляции
  if (user.isVerified)
    throw new DomainException(USER_ACCOUNTS_ERRORS.EMAIL_ALREADY_CONFIRMED);
  if (isAfter(new Date(), user.emailConfirmation.expiresAt))
    throw new DomainException(USER_ACCOUNTS_ERRORS.EMAIL_CONFIRMATION_CODE_EXPIRED);
  if (user.emailConfirmation.code !== command.code)
    throw new DomainException(USER_ACCOUNTS_ERRORS.INVALID_EMAIL_CONFIRMATION_CODE);

  user.confirmEmail(command.code); // теперь метод бессмысленно "доверяет" вызывающему
  await this.usersRepository.update(user);
}
```

Проблемы с таким подходом:

- Логика дублируется или размазывается между use case и сущностью.
- Если бизнес-правило изменится, нужно менять и сущность, и use case.
- Use case становится хрупким — он знает о деталях, которые не его ответственность.

### Оркестрационная проверка → use case

Сущность не может ответить на вопросы, требующие обращения к репозиторию или внешнему сервису.

```ts
// LoginUserUseCase — ПРАВИЛЬНО
async execute(command: LoginUserCommand): Promise<AccessAndRefreshTokensDto> {
  // Оркестрация: пользователь существует?
  const user = await this.usersRepository.findByEmail(command.email);
  if (!user)
    throw new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND);

  // Оркестрация: пароль верный? (требует внешнего сервиса)
  const isPasswordValid = await this.cryptoService.compareHash(
    command.password,
    user.passwordHash,
  );
  if (!isPasswordValid)
    throw new DomainException(USER_ACCOUNTS_ERRORS.INVALID_PASSWORD);

  // Оркестрация: сессия для этого устройства уже существует?
  const existingSession = await this.sessionsRepository.findByDeviceId(command.deviceId);
  if (existingSession)
    throw new DomainException(USER_ACCOUNTS_ERRORS.SESSION_ALREADY_EXISTS);

  // Далее — создание сессии и токенов
  await this.commandBus.execute(new CreateSessionCommand({ userId: user.id, ...command }));
  return this.jwtAdapter.createTokens(user.id, command.deviceId);
}
```

```ts
// ResetPasswordUseCase — ПРАВИЛЬНО
async execute(command: ResetPasswordCommand): Promise<void> {
  // Оркестрация: пользователь с таким кодом существует?
  const user = await this.usersRepository.findByRecoveryPasswordCode(command.recoveryCode);
  if (!user)
    throw new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND);

  // Оркестрация: хешируем новый пароль (требует внешнего сервиса)
  const newPasswordHash = await this.cryptoService.generateHash(command.newPassword);

  // Инвариант: сущность проверяет, что код не истёк и пароль можно сбросить
  user.resetPasswordByRecoveryCode(newPasswordHash);

  await this.usersRepository.update(user);
}
```

### Таблица примеров из проекта

| Проверка                                     | Где бросать | Причина                                         |
| -------------------------------------------- | ----------- | ----------------------------------------------- |
| Код подтверждения email неверный             | Сущность    | Инвариант: сущность владеет кодом               |
| Срок действия кода подтверждения истёк       | Сущность    | Инвариант: сущность владеет датой истечения     |
| Email уже подтверждён                        | Сущность    | Инвариант: сущность владеет флагом `isVerified` |
| Код восстановления пароля не запрашивался    | Сущность    | Инвариант: `recoveryPassword === null`          |
| Код восстановления пароля истёк              | Сущность    | Инвариант: сущность владеет датой истечения     |
| Пользователь с таким email не найден         | Use case    | Требует запрос к `UsersRepository`              |
| Пользователь с таким username уже существует | Use case    | Требует запрос к `UsersRepository`              |
| Пароль не совпадает с хешем                  | Use case    | Требует вызов `CryptoService`                   |
| Сессия не найдена в БД                       | Use case    | Требует запрос к `SessionsRepository`           |
| Refresh token невалидный (JWT)               | Use case    | Требует вызов `JwtAdapter`                      |

---

## 4. `DomainException` не должен зависеть от фреймворка

### Проблема

Если `DomainException` расширяет `RpcException` из `@nestjs/microservices`, то сущность, бросающая `DomainException`, транзитивно зависит от NestJS. Это нарушает Dependency Rule: domain layer не должен знать ни о каком фреймворке.

```
UserEntity (domain)
  → DomainException (@snaptix/common)
    → RpcException (@nestjs/microservices)  ← нарушение: domain знает о транспорте
```

Последствия:

- Нельзя переиспользовать доменный код вне NestJS (например, в скриптах миграции, CLI-утилитах).
- Смена транспорта (TCP → gRPC) требует изменений в `libs/common` и во всех сущностях.
- Unit-тесты сущностей тянут зависимость на `@nestjs/microservices`.

### Решение

`DomainException` в `libs/common` — **чистый класс** без зависимостей на фреймворк:

```ts
// libs/common/src/exceptions/domain.exception.ts — ПРАВИЛЬНО
export class DomainException extends Error {
  constructor(public readonly error: IDomainError<any>) {
    super(error.message);
    this.name = 'DomainException';
  }
}
```

Маппинг в фреймворк-специфичные типы — только в exception filters (infrastructure layer):

```ts
// apps/gateway/src/exception-filters/gateway.exception-filter.ts
@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof DomainException) {
      const { httpCode, message, code, field } = exception.error;
      response.status(httpCode).json({ code, message, field });
      return;
    }

    if (exception instanceof ZodValidationException) {
      response.status(400).json({ errors: exception.getZodError().errors });
      return;
    }

    response.status(500).json({ message: 'Internal server error' });
  }
}
```

```ts
// libs/core/src/exception-filters/microservice.exception-filter.ts
@Catch()
export class MicroserviceExceptionFilter implements RpcExceptionFilter {
  catch(exception: unknown): Observable<never> {
    if (exception instanceof DomainException) {
      // только здесь происходит маппинг в RpcException
      return throwError(() => new RpcException(exception.error));
    }

    if (exception instanceof ZodValidationException) {
      return throwError(
        () => new RpcException({ message: exception.message, httpCode: 400 }),
      );
    }

    return throwError(
      () =>
        new RpcException({ message: 'Internal server error', httpCode: 500 }),
    );
  }
}
```

### Правильная цепочка зависимостей

```
UserEntity (domain)
  → DomainException (@snaptix/common)   ← без фреймворка, чистый Error

GatewayExceptionFilter (infrastructure)
  → DomainException (@snaptix/common)
  → HttpException (@nestjs/common)

MicroserviceExceptionFilter (infrastructure)
  → DomainException (@snaptix/common)
  → RpcException (@nestjs/microservices)
```

### Почему это важно

При смене транспорта (TCP → gRPC → HTTP) или переходе на другой фреймворк изменяются только exception filters в infrastructure layer. Domain layer и `libs/common` остаются нетронутыми.

---

## 5. Связанность модулей в application layer

### Проблема

Application layer одного модуля не должен напрямую импортировать application layer другого модуля.

```ts
// apps/user-accounts/src/modules/auth/application/use-cases/login-user.usecase.ts
// НЕПРАВИЛЬНО: auth импортирует application-слой sessions
import { CreateSessionCommand } from '../../../sessions/application/commands/create-session.usecase';

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase {
  async execute(command: LoginUserCommand): Promise<TokensDto> {
    // ...
    await this.commandBus.execute(new CreateSessionCommand({ ... })); // тесная связь
  }
}
```

Проблемы:

- Модули `auth` и `sessions` становятся неразрывно связаны.
- Нельзя изменить API команды `CreateSessionCommand` без изменения `LoginUserUseCase`.
- Нельзя использовать `sessions` независимо от `auth`.

### Решение через `CommandBus`

Вместо прямого импорта — диспатч через `CommandBus`. Импорт нужен только для класса-команды (DTO), а не для хендлера:

```ts
// ПРАВИЛЬНО: импортируем только команду (DTO), не хендлер
import { CreateSessionCommand } from '../../../sessions/application/commands/create-session.command';

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: LoginUserCommand): Promise<TokensDto> {
    // ...
    // commandBus найдёт нужный хендлер через DI — модули не связаны напрямую
    await this.commandBus.execute(new CreateSessionCommand({ ... }));
  }
}
```

Файл команды (`create-session.command.ts`) содержит только класс-DTO без логики — его импорт не создаёт связанности по поведению.

### Решение через события (для слабой связанности)

Если модули должны быть полностью независимы, используйте `EventBus`:

```ts
// LoginUserUseCase публикует событие — не знает о sessions модуле
await this.eventBus.publish(
  new UserLoggedInEvent({ userId: user.id, deviceId: command.deviceId }),
);

// SessionsModule подписывается на событие самостоятельно
@EventsHandler(UserLoggedInEvent)
export class CreateSessionOnLoginHandler implements IEventHandler<UserLoggedInEvent> {
  async handle(event: UserLoggedInEvent): Promise<void> {
    await this.sessionsRepository.create(SessionEntity.create(event));
  }
}
```

---

## 6. Query-репозиторий vs Repository

### Разделение ответственности

В CQRS паттерне репозитории разделены на два типа:

**Repository (write model)** — работает с доменными сущностями, обслуживает команды:

- Принимает и возвращает доменные сущности (`UserEntity`).
- Содержит методы: `create`, `update`, `delete`, `findOne` (для загрузки агрегата перед изменением).
- Использует `UserConverter` для маппинга между `UserEntity` и Prisma-моделью.

**QueryRepository (read model)** — возвращает проекции, обслуживает запросы:

- Возвращает DTO или простые объекты (не доменные сущности).
- Оптимизирован для чтения: может делать JOIN-ы, выбирать только нужные поля, применять пагинацию.
- Не использует конвертер — нет смысла строить полную сущность ради чтения.

```ts
// UsersRepository (write) — ПРАВИЛЬНО
export class UsersRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const model = await this.prisma.user.findUnique({ where: { email } });
    return model ? this.converter.fromPrismaModelToEntity(model) : null;
  }

  async update(entity: UserEntity): Promise<void> {
    const model = this.converter.fromEntityToPrismaModel(entity);
    await this.prisma.user.update({ where: { id: model.id }, data: model });
  }
}

// UsersQueryRepository (read) — ПРАВИЛЬНО
export class UsersQueryRepository {
  async findById(id: string): Promise<GetMeResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, username: true, email: true, isVerified: true }, // только нужные поля
    });
    return user ?? null;
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedUsersDto> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, username: true, email: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);
    return { items, total, page, limit };
  }
}
```

### Когда использовать какой

| Сценарий                                     | Репозиторий            |
| -------------------------------------------- | ---------------------- |
| Загрузить агрегат для изменения              | `UsersRepository`      |
| Получить данные для отображения пользователю | `UsersQueryRepository` |
| Проверить уникальность при создании          | `UsersRepository`      |
| Построить список с фильтрами и пагинацией    | `UsersQueryRepository` |
| Восстановить сущность после события          | `UsersRepository`      |

### Недопустимые паттерны

```ts
// НАРУШЕНИЕ: сырой SQL в репозитории
async findAll(): Promise<User[]> {
  return this.prisma.$queryRaw`SELECT * FROM users`; // теряется типизация, риск SQL-инъекций
}

// ПРАВИЛЬНО: использовать Prisma API
async findAll(): Promise<User[]> {
  return this.prisma.user.findMany({ where: { deletedAt: null } });
}
```

```ts
// НАРУШЕНИЕ: QueryRepository возвращает доменную сущность
async findById(id: string): Promise<UserEntity> { // зачем строить сущность для чтения?
  const model = await this.prisma.user.findUnique({ where: { id } });
  return this.converter.fromPrismaModelToEntity(model);
}

// ПРАВИЛЬНО: QueryRepository возвращает DTO
async findById(id: string): Promise<GetMeResponseDto | null> {
  return this.prisma.user.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, username: true, email: true, isVerified: true },
  });
}
```
