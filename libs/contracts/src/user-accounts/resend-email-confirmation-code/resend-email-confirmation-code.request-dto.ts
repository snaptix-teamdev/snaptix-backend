import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export class ResendEmailConfirmationCodeRequestDto extends createZodDto(
  requestSchema,
) {}
