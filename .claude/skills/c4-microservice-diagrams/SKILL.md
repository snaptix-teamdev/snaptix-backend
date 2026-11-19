---
name: c4-microservice-diagrams
description: Строит и обновляет C4-диаграммы взаимодействия микросервисов Snaptix Backend (NestJS-монорепо) — всегда в формате C4-PlantUML (.puml). Используй, когда просят визуализировать «как общаются микросервисы», архитектуру, C4 container / system context / collaboration (communication) диаграмму, или сгенерировать/обновить диаграмму. Триггеры: «диаграмма», «архитектура», «C4», «как общаются сервисы», «collaboration», «PlantUML», «puml», «Structurizr», «Mermaid».
---

# C4-диаграммы взаимодействия микросервисов

Подход: [C4 model](https://c4model.com/). Уровни — **L1 System Context** (система + окружение),
**L2 Container** (сервисы и связи между ними, БЕЗ внутренностей), **L3 Component** (слои внутри
сервиса), **L4 Code**. Запрос «как общаются микросервисы без деталей внутри» ⇒ **L2 Container**;
пошаговые сценарии с нумерованными сообщениями ⇒ **Dynamic / collaboration view**.

## Процесс (всегда сначала анализ кода, потом рисование)

### Шаг 1. Найти сервисы и транспорт

- Сервисы = `apps/*/src/main.ts`. **Не доверяй AGENTS.md** — список сервисов там устаревает
  (были указаны 3, по факту 6: gateway, user-accounts, posts, files, geo, notifications).
- В каждом `main.ts` определи роль по bootstrap:
  - `app.listen(...)` без микросервиса → HTTP-вход (gateway) или чистый consumer (notifications).
  - `connectMicroservice({ transport: Transport.TCP, ... })` → TCP-микросервис (запрос-ответ).

### Шаг 2. Классифицировать связи

Три вида, каждый рисуется по-своему:

| Вид                                           | Как найти в коде                                                                                                                                                                                  | Стиль на диаграмме        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **Синхронно (TCP/HTTP)** — запрос-ответ       | Gateway: `ClientsModule.registerAsync`, `ClientProxy.send(...)`, `MICROSERVICE_NAME.*`, `*_PATTERNS.*`. Между сервисами тоже (напр. `posts → files`).                                             | сплошная стрелка          |
| **Асинхронно (RabbitMQ)** — publish/subscribe | Publish: `amqpConnection.publish(EXCHANGE, ROUTING_KEY, ...)`, часто через outbox (`outbox-relay`). Subscribe: `@RabbitSubscribe({ exchange, routingKey, queue })`. `@golevelup/nestjs-rabbitmq`. | пунктирная стрелка        |
| **Хранилища**                                 | Prisma-схема на сервис (`apps/*/prisma/schema.prisma`) → database-per-service. S3/MinIO: `@aws-sdk/client-s3`. SMTP: `@nestjs-modules/mailer`.                                                    | цилиндр / внешняя система |

Grep-паттерны для быстрой разведки:

```
RabbitSubscribe|amqpConnection.publish|@RabbitSubscribe   # async события
ClientsModule|ClientProxy|MICROSERVICE_NAME|Transport\.TCP # sync TCP
S3Client|@aws-sdk|PutObjectCommand|presign                # объектное хранилище
```

Читай `apps/gateway/src/modules/gateway/gateway.module.ts` (к каким сервисам подключён gateway) и
`application/*.service.ts` (какие паттерны шлёт). Читай `*.handler.ts` в `notifications`/`files`
(кто на какие события подписан) и `*/application/commands/*.usecase.ts` в `user-accounts`/`posts`
(кто что публикует).

### Шаг 3. Собрать модель взаимодействия

Зафиксируй: акторы (Client) → gateway (HTTP) → сервисы (TCP); межсервисные TCP; события через
RabbitMQ (exchange + routing key + издатель + подписчики); БД на сервис; внешняя инфра (S3, SMTP).
Актуальная карта Snaptix — в `.puml`-файлах: `docs/c4-container.puml` (L2 Container) и
`docs/c4-dynamic-*.puml` (сценарии). **При изменениях в коде сверяй и обновляй эти файлы.**

### Шаг 4. Сгенерировать в C4-PlantUML

**Формат вывода всегда один — C4-PlantUML (`.puml`).** Не спрашивай формат и не используй
Mermaid, Structurizr DSL или HTML. Даже если пользователь назвал другой формат — генерируй
C4-PlantUML (это осознанное правило проекта). Выбирай только уровень/вид диаграммы под запрос:

- L2 Container (сервисы и связи, без внутренностей) → файл вида `docs/c4-container*.puml`,
  `!include .../C4_Container.puml`.
- Component (слои внутри одного сервиса) → `!include .../C4_Component.puml`.
- Dynamic / collaboration (пошаговый сценарий с нумерованными сообщениями) →
  `docs/c4-dynamic-<scenario>.puml`, `!include .../C4_Dynamic.puml`.
  При сомнении в _виде_ («collaboration» = communication diagram с нумерованными сообщениями) —
  уточни; формат уточнять не нужно, он всегда C4-PlantUML.

## Формат вывода: C4-PlantUML

| Файл в `docs/`                                                | Что содержит                       | Просмотр                                                                  |
| ------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| `c4-container.puml`                                           | L2 Container — вся система         | PlantUML Integration (JetBrains) / PlantUML ext (VS Code), нужен Graphviz |
| `c4-<service>-container.puml` / `c4-<service>-component.puml` | фокус на один сервис               | то же                                                                     |
| `c4-dynamic-*.puml`                                           | пошаговые сценарии (collaboration) | то же                                                                     |

Правила C4-PlantUML:

- Контейнерный вид — `!include .../C4_Container.puml`; компонентный — `C4_Component.puml`;
  dynamic — `C4_Dynamic.puml`, где `Rel(...)` **сам нумерует** сообщения (НЕ `RelIndex`, у него
  первый аргумент — индекс).
- Элементы: `ContainerQueue` для RabbitMQ, `ContainerDb` для БД, `System_Ext` для внешней инфры
  (S3/MinIO, SMTP), `Container`/`Component` для сервисов и слоёв, `Person` для актора.
- Связи: `Rel(...)` для синхронных (TCP/HTTP) — сплошная; `Rel_D`/`BiRel`/пунктир через
  `Rel(..., $tags=...)` для асинхронных (RabbitMQ). Подписывай транспорт и pattern/routing key.
- `!include` идёт по URL с GitHub → для рендера нужен интернет; при оффлайне положи C4-PlantUML
  локально и переключи `!include` на локальный путь.
- Держись единой палитры ниже через `AddElementTag` / `UpdateElementStyle`.

## Единая палитра (держи диаграммы согласованными)

- микросервис / контейнер: `#2f6690` (fill `#e7f0f7`)
- gateway (точка входа): `#0d5c63` (fill `#dcefef`)
- брокер (RabbitMQ): `#a8620a` (fill `#fbeed6`)
- хранилище/инфра (PostgreSQL, S3, SMTP): `#55657a` (fill `#e8edf3`)
- актор (Client): `#2a3646`
- легенда: сплошная = синхронно (TCP/HTTP), пунктир = асинхронно (RabbitMQ)
