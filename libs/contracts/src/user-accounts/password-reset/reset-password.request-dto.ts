import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const resetPasswordSchema = z.object({
  code: z.string().trim(),

  password: z
    .string()
    .trim()
    .min(6)
    .max(20)
    .regex(
      /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[0-9A-Za-z!"#$%&'()*+,\-./:;<=>?@[\\\]^_{|}~]+$/,
    ),
});

export class ResetPasswordRequestDto extends createZodDto(
  resetPasswordSchema,
) {}
