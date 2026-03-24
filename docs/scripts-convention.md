# Папка `scripts/`

---

## Назначение

Папка `scripts/` содержит вспомогательные скрипты, которые **не являются частью рантайма приложения**. Они запускаются вручную, из `package.json` или в CI/CD-пайплайнах для автоматизации рутинных задач разработки, сборки и деплоя.

---

## Правило

> Если код не импортируется другими модулями и не работает в рантайме — ему место в `scripts/`.

---

## Что должно лежать в `scripts/`

| Категория          | Примеры                                                        |
| ------------------ | -------------------------------------------------------------- |
| ORM / База данных  | Обёртки для миграций, сиды, сброс БД, бэкапы                   |
| Генерация          | Генерация ключей, сертификатов, `.env`-файлов из шаблонов      |
| Кодогенерация      | Генерация типов из OpenAPI/Swagger, gRPC proto-компиляция      |
| Сборка и деплой    | Скрипты сборки Docker-образов, публикации пакетов              |
| CI/CD              | Проверки перед коммитом, линтинг, прогон тестов с флагами      |
| Очистка            | Удаление `node_modules`, `dist`, кэшей, временных файлов       |
| Инфраструктура     | Поднятие/остановка Docker-контейнеров, инициализация окружения |
| Утилиты разработки | Проверка переменных окружения, валидация конфигов              |

---

## Что НЕ должно лежать в `scripts/`

| Не сюда                  | Куда                                   |
| ------------------------ | -------------------------------------- |
| Бизнес-логика            | `apps/` или `libs/domain/`             |
| Переиспользуемые утилиты | `libs/common/utils/`                   |
| NestJS-модули            | `libs/core/`                           |
| Тестовые хелперы и моки  | `libs/testing/`                        |
| Конфиги приложения       | корень проекта или `libs/core/config/` |

---

## Рекомендации по структуре

### Плоская (для небольших проектов, до ~10 скриптов)

```
scripts/
├── prisma-wrapper.ts
├── generate-keys.ts
├── seed.ts
├── clean.sh
└── docker-build.sh
```

### Группированная (для крупных проектов)

```
scripts/
├── db/
│   ├── prisma-wrapper.ts
│   ├── seed.ts
│   ├── reset.ts
│   └── backup.sh
├── codegen/
│   ├── generate-types.ts
│   └── compile-proto.sh
├── docker/
│   ├── build.sh
│   └── push.sh
├── ci/
│   ├── pre-commit.sh
│   └── check-env.ts
└── setup/
    ├── init-env.ts
    └── generate-keys.ts
```

---

## Нейминг

| Правило                         | Пример                                       |
| ------------------------------- | -------------------------------------------- |
| Имя отражает действие           | `seed.ts`, `reset-db.ts`, `generate-keys.ts` |
| Kebab-case                      | `prisma-wrapper.ts`, не `prismaWrapper.ts`   |
| Без префиксов `run-`, `script-` | `seed.ts`, не `run-seed.ts`                  |
| Расширение соответствует языку  | `.ts` для TypeScript, `.sh` для Bash         |

---

## Интеграция с `package.json`

Каждый скрипт должен быть доступен через `npm run`:

```json
{
  "scripts": {
    "db:migrate": "ts-node scripts/db/prisma-wrapper.ts 'prisma migrate dev' .env",
    "db:seed": "ts-node scripts/db/seed.ts",
    "db:reset": "ts-node scripts/db/reset.ts",
    "generate:keys": "ts-node scripts/setup/generate-keys.ts",
    "docker:build": "bash scripts/docker/build.sh",
    "clean": "bash scripts/clean.sh"
  }
}
```

### Правила именования npm-скриптов

- Группировка через `:` — `db:migrate`, `db:seed`, `db:reset`
- Глагол или действие — `generate:keys`, не `keys`
- Консистентность — если есть `db:migrate`, то `db:seed`, а не `seed-database`

---

## Рекомендации по написанию скриптов

### 1. Логирование

Всегда выводить, что скрипт делает:

```typescript
console.log(`
###################################
# Running: ${scriptName}
# Environment: ${env}
###################################
`);
```

### 2. Обработка ошибок

Не допускать тихих падений:

```typescript
try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error(`Script failed: ${error.message}`);
  process.exit(1);
}
```

### 3. Аргументы командной строки

Для простых скриптов — `process.argv`:

```typescript
const command = process.argv[2];
const envPath = process.argv[3];
```

Для сложных — использовать библиотеку (`commander`, `yargs`):

```typescript
import { Command } from 'commander';

const program = new Command();
program
  .option('-e, --env <path>', 'путь к .env файлу')
  .option('-c, --command <cmd>', 'команда для выполнения')
  .parse();
```

### 4. Переменные окружения

Загружать `.env` явно, не полагаться на глобальное окружение:

```typescript
import { config } from 'dotenv';
config({ path: envFilePath });
```

### 5. Идемпотентность

Скрипты должны быть безопасны для повторного запуска. Проверять текущее состояние перед действием:

```typescript
// Плохо — упадёт если директория уже есть
mkdirSync('dist');

// Хорошо — создаст только если нет
mkdirSync('dist', { recursive: true });
```

### 6. Документирование

Каждый скрипт должен поддерживать флаг `--help` или содержать комментарий в начале файла:

```typescript
/**
 * prisma-wrapper.ts
 *
 * Обёртка для запуска Prisma CLI с корректной загрузкой .env.
 *
 * Использование:
 *   ts-node scripts/prisma-wrapper.ts <prisma-command> <env-file-path>
 *
 * Пример:
 *   ts-node scripts/prisma-wrapper.ts "prisma migrate dev" .env
 */
```

---

## Чеклист перед добавлением нового скрипта

1. Скрипт **не импортируется** другим кодом проекта?
2. Скрипт **не работает** в рантайме приложения?
3. Добавлена команда в `package.json`?
4. Есть логирование и обработка ошибок?
5. Скрипт идемпотентен (безопасен для повторного запуска)?
6. Есть комментарий-документация в начале файла?
