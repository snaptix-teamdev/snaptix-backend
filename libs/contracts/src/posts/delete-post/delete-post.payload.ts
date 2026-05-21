import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CommonSchemas } from '@snaptix/contracts/schemas';

const payload = z.object({
  postId: CommonSchemas.uuid,
  userId: CommonSchemas.uuid,
});

export class DeletePostPayload extends createZodDto(payload) {}
