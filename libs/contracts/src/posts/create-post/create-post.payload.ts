import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CommonSchemas, PostSchemas } from '@snaptix/contracts/schemas';

const payload = z.object({
  userId: CommonSchemas.uuid,
  description: PostSchemas.description,
  media: PostSchemas.media,
});

export class CreatePostPayload extends createZodDto(payload) {}
