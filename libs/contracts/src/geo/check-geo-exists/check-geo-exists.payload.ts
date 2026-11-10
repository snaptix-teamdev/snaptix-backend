import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GeoSchemas } from '@snaptix/contracts/schemas/geo.schemas';

const payload = z.object({
  countryId: GeoSchemas.countryId,
  regionId: GeoSchemas.regionId,
  cityId: GeoSchemas.cityId,
});

export class CheckGeoExistsPayload extends createZodDto(payload) {}
