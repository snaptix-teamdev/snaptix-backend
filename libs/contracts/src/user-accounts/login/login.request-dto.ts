import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),

  password: z.string().trim(),
});

export class LoginRequestDto extends createZodDto(loginSchema) {}
