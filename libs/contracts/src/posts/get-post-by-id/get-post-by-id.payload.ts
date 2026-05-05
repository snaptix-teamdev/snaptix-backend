import z from 'zod';
import { createZodDto } from 'nestjs-zod';

const payload = z.object({
  id: z.string().trim().uuid(),
});

export class GetPostByIdPayload extends createZodDto(payload) {}
