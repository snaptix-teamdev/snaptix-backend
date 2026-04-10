import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const getMePayloadSchema = z.object({
  id: z.string().trim().uuid(),
});

export class GetMePayload extends createZodDto(getMePayloadSchema) {}
