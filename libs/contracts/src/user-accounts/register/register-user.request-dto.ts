import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RequestSchema = z.object({
  username: z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[0-9A-Za-z_-]+$/),

  email: z.string().trim().toLowerCase().email(),

  password: z
    .string()
    .trim()
    .min(6)
    .max(20)
    .regex(
      /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[0-9A-Za-z!"#$%&'()*+,\-./:;<=>?@[\\\]^_{|}~]+$/,
    ),
});

export class RegisterUserRequestDto extends createZodDto(RequestSchema) {}
