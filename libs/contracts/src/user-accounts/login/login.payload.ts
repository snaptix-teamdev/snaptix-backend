import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const loginPayloadSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim(),
  ip: z.string(),
  deviceName: z.string(),
});

export class LoginPayload extends createZodDto(loginPayloadSchema) {}
