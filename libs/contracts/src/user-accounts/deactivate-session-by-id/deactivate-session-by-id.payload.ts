import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CommonSchemas } from '@snaptix/contracts/schemas';

const payload = z.object({
  refreshToken: z.string().trim().min(1),
  deviceId: CommonSchemas.uuid,
});

export class DeactivateSessionByIdPayload extends createZodDto(payload) {}
