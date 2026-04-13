import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const clientDetailsSchema = z.object({
  ip: z.string(),
  deviceName: z.string(),
});

export class ClientDetailsRequestDto extends createZodDto(
  clientDetailsSchema,
) {}
