import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CommonSchemas, PostSchemas } from '@snaptix/contracts/schemas';

const payload = z.object({
  postId: CommonSchemas.uuid,
  userId: CommonSchemas.uuid,
  description: PostSchemas.description,
});

export class UpdatePostPayload extends createZodDto(payload) {}
