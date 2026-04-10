import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const passwordForgotSchema = z.object({
  email: z.string().trim().toLowerCase().email(),

  recaptchaToken: z.string().trim(),
});

export class PasswordForgotRequestDto extends createZodDto(
  passwordForgotSchema,
) {}
