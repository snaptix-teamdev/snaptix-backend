import z from 'zod';
import { createZodDto } from 'nestjs-zod';

const payload = z.object({
  countryId: z.coerce.number().int().positive().optional(),
  regionId: z.coerce.number().int().positive().optional(),
});

export class GetGeoQueryRequestDto extends createZodDto(payload) {}
