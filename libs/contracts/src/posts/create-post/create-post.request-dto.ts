import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PostSchemas } from '@snaptix/contracts/schemas';

const request = z.object({
  description: PostSchemas.description,
  media: PostSchemas.media,
});

export class CreatePostRequestDto extends createZodDto(request) {}
