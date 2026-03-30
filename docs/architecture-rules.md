# Архитектурные правила — Snaptix Backend

---

## Зависимости типов в use cases (application layer)

Use cases должны ссылаться на доменные **интерфейсы** (`IUser`, `IOrder` и т.д.), а не на конкретные классы сущностей (`UserEntity`), при объявлении возвращаемых типов и промежуточных типов.

Конкретные классы используются только для вызова фабричных методов (`Entity.create()`, `Entity.restore()`).

```ts
// Правильно — зависимость от интерфейсного контракта
import { IUser } from '@snaptix/common';
type CommandResponse = Pick<IUser, 'id'>;

// Неправильно — зависимость от конкретного класса
import { UserEntity } from '../domain/user.entity';
type CommandResponse = Pick<UserEntity, 'id'>;
```

**Почему:** application-слой должен зависеть от стабильных абстракций (`libs/common` интерфейсы), а не от реализаций доменного слоя. Это соответствует принципу инверсии зависимостей (DIP): при переименовании или изменении `UserEntity` тип возврата use case остаётся незатронутым.
