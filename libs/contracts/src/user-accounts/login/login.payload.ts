import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const loginPayloadSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim(),
  ip: z.string().nullable(),
  userAgent: z.string(),
});

export class LoginPayload extends createZodDto(loginPayloadSchema) {}
