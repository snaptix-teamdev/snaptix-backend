import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const payloadSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export class ResendEmailConfirmationCodePayload extends createZodDto(
  payloadSchema,
) {}
