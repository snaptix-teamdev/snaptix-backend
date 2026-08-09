import z from 'zod';
import { createZodDto } from 'nestjs-zod';

const payload = z.object({
  countryId: z.coerce.number().int().positive(),
  regionId: z.coerce.number().int().positive(),
  cityId: z.coerce.number().int().positive(),
});

export class CheckGeoExistsPayload extends createZodDto(payload) {}
