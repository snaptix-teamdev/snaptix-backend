import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PostSchemas } from '@snaptix/contracts/schemas';

const request = z.object({
  description: PostSchemas.description,
});

export class UpdatePostRequestDto extends createZodDto(request) {}
