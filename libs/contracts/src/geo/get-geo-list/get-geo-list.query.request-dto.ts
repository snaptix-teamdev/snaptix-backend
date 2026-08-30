import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GeoSchemas } from '@snaptix/contracts/schemas/geo.schemas';

const payload = z.object({
  countryId: GeoSchemas.countryId.optional(),
  regionId: GeoSchemas.regionId.optional(),
});

export class GetGeoListQueryRequestDto extends createZodDto(payload) {}
