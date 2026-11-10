import { z } from 'zod';
import { CommonSchemas } from '@snaptix/contracts/schemas';
import { createZodDto } from 'nestjs-zod';

const deleteUserAvatarPayloadSchema = z.object({
  userId: CommonSchemas.uuid,
});

export class DeleteUserAvatarPayload extends createZodDto(
  deleteUserAvatarPayloadSchema,
) {}
