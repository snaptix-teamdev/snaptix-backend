import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GeoLang } from '../enums/geo-lang.enum';

const payload = z.object({
  countryId: z.coerce.number().int().positive().optional(),
  regionId: z.coerce.number().int().positive().optional(),
  lang: z.enum(GeoLang),
});

export class GetGeoPayload extends createZodDto(payload) {}
