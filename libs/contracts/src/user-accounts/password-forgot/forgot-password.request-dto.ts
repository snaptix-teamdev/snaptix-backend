import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),

  recaptchaToken: z.string().trim(),
});

export class ForgotPasswordRequestDto extends createZodDto(
  forgotPasswordSchema,
) {}
