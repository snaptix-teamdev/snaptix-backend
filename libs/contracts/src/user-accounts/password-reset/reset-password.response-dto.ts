import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const resetPasswordSchema = z.object();

export class ResetPasswordResponseDto extends createZodDto(
  resetPasswordSchema,
) {}
