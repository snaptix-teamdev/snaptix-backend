import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const RequestSchema = z.object({
  code: z.string().trim().uuid(),
});

export class RegistrationConfirmationRequestDto extends createZodDto(
  RequestSchema,
) {}
