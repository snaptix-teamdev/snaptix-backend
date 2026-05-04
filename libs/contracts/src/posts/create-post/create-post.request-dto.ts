import z from 'zod';
import { createZodDto } from 'nestjs-zod';

const request = z.object({
  description: z.string().trim().min(0).max(500).nullable(),
  media: z.array(
    z.object({
      fileId: z.string().trim().uuid(),
    }),
  ),
});

export class CreatePostRequestDto extends createZodDto(request) {}
