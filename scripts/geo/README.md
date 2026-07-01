# Geo data (GeoNames)

Импорт гео-справочника (страны, регионы, города) в БД сервиса `geo` из полных
дампов [GeoNames](https://download.geonames.org/export/dump/).

Файлы данных (`scripts/geo/data/`, ~780 МБ) **не хранятся в git** — они раздаются
через GitHub Release как один архив `geo-data.tar.gz`.

## Для разработчика: развернуть данные

> Репозиторий приватный, поэтому нужен авторизованный [GitHub CLI](https://cli.github.com/)
> (`gh auth login`) — скрипт качает ассет через `gh release download`, а не по
> прямой ссылке (она для приватного репо вернёт 404).

```bash
pnpm geo:data:download        # скачать и распаковать данные в scripts/geo/data
pnpm geo:prisma:reset:dev      # очистить БД + накатить миграции
pnpm geo:import:dev            # импортировать GeoNames в БД
```

## Состав данных

| Файл                   | Источник GeoNames      | Назначение                                         |
| ---------------------- | ---------------------- | -------------------------------------------------- |
| `countryInfo.txt`      | `countryInfo.txt`      | страны (ISO2/ISO3, geonameid)                      |
| `admin1CodesASCII.txt` | `admin1CodesASCII.txt` | регионы (admin1)                                   |
| `cities500.txt`        | `cities500.zip`        | города с населением > 500                          |
| `alternateNamesV2.txt` | `alternateNamesV2.zip` | альтернативные названия (импорт берёт только `ru`) |

> Полные дампы GeoNames. `alternateNamesV2.txt` большой (~740 МБ, все языки) —
> импорт сканирует его целиком, отбирая строки с `lang = ru`.

## Обновить данные в Release (мейнтейнер)

```bash
# 1. Обнови файлы в scripts/geo/data/, затем пересобери архив:
tar -czf scripts/geo/geo-data.tar.gz -C scripts/geo/data \
  admin1CodesASCII.txt alternateNamesV2.txt cities500.txt countryInfo.txt

# 2. Создай/обнови Release с ассетом (тег должен совпадать с TAG в download-data.ts):
gh release create geo-data-v1 scripts/geo/geo-data.tar.gz \
  --title "Geo data (GeoNames)" --notes "GeoNames dumps for geo service import"

# Если Release с тегом уже есть — просто перезалей ассет:
gh release upload geo-data-v1 scripts/geo/geo-data.tar.gz --clobber
```

При смене набора данных увеличивай версию тега (`geo-data-v2`) и синхронно правь
константу `TAG` в `scripts/geo/download-data.ts`.
