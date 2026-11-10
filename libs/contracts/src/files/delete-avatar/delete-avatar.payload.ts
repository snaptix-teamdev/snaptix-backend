import { z } from 'zod';
import { CommonSchemas } from '@snaptix/contracts';
import { createZodDto } from 'nestjs-zod';

const deleteAvatarPayloadSchema = z.object({
  profileId: CommonSchemas.uuid,
});

export class DeleteAvatarPayload extends createZodDto(
  deleteAvatarPayloadSchema,
) {}
