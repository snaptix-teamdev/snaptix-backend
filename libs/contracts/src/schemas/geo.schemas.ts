import z from 'zod';

/**
 * Верхняя граница Postgres `integer` — тип колонок id в справочнике geo.
 * Без неё значение больше int4 проходит валидацию и падает уже в БД,
 * то есть клиент получает 500 вместо 400.
 */
const POSTGRES_INT4_MAX = 2_147_483_647;

export namespace GeoSchemas {
  /** Общая форма id справочника — наружу отдаём именованные поля ниже */
  const geoId = z.coerce.number().int().positive().max(POSTGRES_INT4_MAX);

  export const countryId = geoId;
  export const regionId = geoId;
  export const cityId = geoId;
}
