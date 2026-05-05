import z from 'zod';
import { createZodDto } from 'nestjs-zod';

const payload = z.object({
  userId: z.string().trim().uuid(),
  description: z.string().trim().min(0).max(500).nullable(),
  media: z.array(
    z.object({
      fileId: z.string().trim().uuid(),
    }),
  ),
});

export class CreatePostPayload extends createZodDto(payload) {}
