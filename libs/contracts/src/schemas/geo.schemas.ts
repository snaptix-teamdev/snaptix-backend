import z from 'zod';

const POSTGRES_INT4_MAX = 2_147_483_647;

export namespace GeoSchemas {
  const geoId = z.coerce.number().int().positive().max(POSTGRES_INT4_MAX);

  export const countryId = geoId;
  export const regionId = geoId;
  export const cityId = geoId;
}
