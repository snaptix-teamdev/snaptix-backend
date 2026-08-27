import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CommonSchemas } from '@snaptix/contracts/schemas';

const getProfileSettingsSchema = z.object({
  userId: CommonSchemas.uuid,
});

export class GetProfileSettingsPayload extends createZodDto(
  getProfileSettingsSchema,
) {}
