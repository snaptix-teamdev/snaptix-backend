import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GeoLang } from '../enums/geo-lang.enum';
import { GeoSchemas } from '@snaptix/contracts/schemas/geo.schemas';

const payload = z.object({
  countryId: GeoSchemas.countryId.nullable(),
  regionId: GeoSchemas.regionId.nullable(),
  cityId: GeoSchemas.cityId.nullable(),
  lang: z.enum(GeoLang),
});

export class ResolveGeoNamesPayload extends createZodDto(payload) {}
