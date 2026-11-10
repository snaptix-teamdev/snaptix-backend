import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GeoLang } from '../enums/geo-lang.enum';
import { GeoSchemas } from '@snaptix/contracts/schemas/geo.schemas';

const payload = z.object({
  countryId: GeoSchemas.countryId.optional(),
  regionId: GeoSchemas.regionId.optional(),
  lang: z.enum(GeoLang),
});

export class GetGeoListPayload extends createZodDto(payload) {}
