import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const forgotPasswordPayloadSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
export class ForgotPasswordPayload extends createZodDto(
  forgotPasswordPayloadSchema,
) {}
