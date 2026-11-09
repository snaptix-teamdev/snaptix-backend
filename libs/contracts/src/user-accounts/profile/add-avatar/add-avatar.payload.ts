import { z } from 'zod';
import { CommonSchemas } from '@snaptix/contracts/schemas';
import { createZodDto } from 'nestjs-zod';

const addAvatarPayloadSchema = z.object({
  userId: CommonSchemas.uuid,
  fileId: CommonSchemas.uuid,
});

export class AddAvatarPayload extends createZodDto(addAvatarPayloadSchema) {}
