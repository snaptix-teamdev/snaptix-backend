# Geo data (GeoNames)

Импорт гео-справочника (страны, регионы, города) в БД сервиса `geo` из полных дампов [GeoNames](https://download.geonames.org/export/dump/).

Файлы данных (`scripts/geo/data/`, ~780 МБ) **не хранятся в git** — они раздаются через GitHub Release `geo-data-v1` как один архив `geo-data.tar.gz` (~205 МБ).

## Локальная разработка

### 1. GitHub CLI

Репозиторий приватный: прямая ссылка на архив без токена отдаёт 404. Поэтому `geo:data:download` скачивает его через [GitHub CLI](https://cli.github.com/) (`gh release download`). `gh` достаточно один раз установить и авторизовать.

Установка:

- macOS: `brew install gh`
- Windows: `winget install --id GitHub.cli`
- Linux: по [официальной инструкции](https://github.com/cli/cli/blob/trunk/docs/install_linux.md), для Debian и Ubuntu там описан apt-репозиторий.

Авторизация:

```bash
gh auth login
```

В диалоге выберите `GitHub.com`, протокол `HTTPS` и вход через браузер. Аккаунт должен иметь доступ к репозиторию `snaptix-teamdev/snaptix-backend`. Проверить вход можно командой `gh auth status`: её же первым делом выполняет `geo:data:download` и без авторизации сразу завершается с подсказкой.

### 2. Скачивание и импорт

```bash
pnpm geo:data:download
pnpm geo:import:dev
```

**`geo:data:download`** скачивает `geo-data.tar.gz` из Release `geo-data-v1`, распаковывает его в `scripts/geo/data/`, удаляет архив и проверяет, что на месте все четыре файла из [состава данных](#состав-данных). Повторный запуск скачивает архив заново и перезаписывает файлы.

**`geo:import:dev`** сначала через pre-хук `pregeo:import:dev` поднимает Docker (`docker:up`), генерирует Prisma Client и применяет миграции. Поэтому импорт можно запускать на свежем клоне, до первого `pnpm start:dev:all`, и отдельный терминал для него не нужен.

Затем скрипт загружает данные в БД из `POSTGRES_GEO_URL`. Переменные берутся из `apps/geo/` с `NODE_ENV=development`, как описано в разделе [«Порядок загрузки»](../../README.md#порядок-загрузки) корневого README. Импортируются страны, регионы (admin1) и города с населением больше 500 человек. Для каждой записи сохраняются названия на английском и на русском, а если русского названия нет, берётся английское. Сначала скрипт целиком читает `alternateNamesV2.txt` и собирает из него русские названия, поэтому после строки `Building Russian names map from alternateNamesV2.txt...` какое-то время ничего не выводится.

Данные хранятся в volume контейнера Postgres. `pnpm docker:stop` их сохраняет, а `pnpm docker:down` удаляет вместе с volumes, после этого импорт нужно запустить снова.

## Повторный импорт

Импорт вставляет записи с `skipDuplicates`: при повторном запуске дубли не появятся, но и уже существующие записи не обновятся. Чтобы загрузить данные начисто, сначала сбросьте БД:

```bash
pnpm geo:prisma:reset:dev && pnpm geo:import:dev
```

`geo:prisma:reset:dev` удаляет все данные в БД из `POSTGRES_GEO_URL` (по умолчанию это локальная база `geo` в контейнере из `docker-compose.yml`) и заново применяет миграции.

## Импорт в прод

Справочник загружается в прод один раз, с вашей машины: тем же скриптом, но с `NODE_ENV=production`. Прод-БД должна быть доступна с машины, на которой вы запускаете импорт.

1. **Сервис `geo` задеплоен.** Миграции применяются при старте его контейнера (`geo:prisma:deploy:prod` в `apps/geo/Dockerfile`). Сам `geo:import:prod` миграции не применяет, чтобы с локальной машины не накатить на прод миграции из текущей ветки.
2. **Данные скачаны и Prisma Client сгенерирован.** Если вы уже запускали `geo:import:dev`, оба условия выполнены. Иначе выполните `pnpm geo:data:download` и `pnpm geo:prisma:generate`.
3. **Строка подключения задана.** Создайте `apps/geo/.env.production.local`: файл в `.gitignore`, а при `NODE_ENV=production` он читается первым.

   ```dotenv
   POSTGRES_GEO_URL=postgresql://<username>:<password>@<hostname>:<port>/<database-name>
   ```

4. **Импорт:**

   ```bash
   pnpm geo:import:prod
   ```

5. **Уборка.** Удалите `apps/geo/.env.production.local`, чтобы следующие локальные запуски с `NODE_ENV=production` случайно не пошли в прод.

Повторный запуск безопасен: из-за `skipDuplicates` дубли не появятся, но и существующие записи не обновятся. Чтобы загрузить данные в прод начисто, на шаге 4 сначала сбросьте прод-БД:

```bash
pnpm geo:prisma:reset:prod && pnpm geo:import:prod
```

`geo:prisma:reset:prod` удаляет все данные в БД из `POSTGRES_GEO_URL`, заданной в `apps/geo/.env.production.local`, и заново применяет миграции. Перед сбросом Prisma спрашивает подтверждение. Миграции берутся из вашей рабочей копии, поэтому запускайте сброс с того же коммита, что задеплоен в прод: иначе в прод попадут миграции, которых там ещё нет. `geo:prisma:reset:dev` берёт строку подключения из dev-файлов и прод не трогает.

## Состав данных

| Файл                   | Источник GeoNames      | Назначение                                         |
| ---------------------- | ---------------------- | -------------------------------------------------- |
| `countryInfo.txt`      | `countryInfo.txt`      | страны (ISO2/ISO3, geonameid)                      |
| `admin1CodesASCII.txt` | `admin1CodesASCII.txt` | регионы (admin1)                                   |
| `cities500.txt`        | `cities500.zip`        | города с населением > 500                          |
| `alternateNamesV2.txt` | `alternateNamesV2.zip` | альтернативные названия (импорт берёт только `ru`) |

> Полные дампы GeoNames. `alternateNamesV2.txt` большой (~740 МБ, все языки) — импорт сканирует его целиком, отбирая строки с `lang = ru`.

## Обновить данные в Release (мейнтейнер)

```bash
# 1. Обновите файлы в scripts/geo/data/, затем пересоберите архив:
tar -czf scripts/geo/geo-data.tar.gz -C scripts/geo/data \
  admin1CodesASCII.txt alternateNamesV2.txt cities500.txt countryInfo.txt

# 2. Создайте или обновите Release с ассетом (тег должен совпадать с TAG в download-data.ts):
gh release create geo-data-v1 scripts/geo/geo-data.tar.gz \
  --title "Geo data (GeoNames)" --notes "GeoNames dumps for geo service import"

# Если Release с тегом уже есть, просто перезалейте ассет:
gh release upload geo-data-v1 scripts/geo/geo-data.tar.gz --clobber
```

При смене набора данных увеличивайте версию тега (`geo-data-v2`) и синхронно правьте константу `TAG` в `scripts/geo/download-data.ts`.
