import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const getUploadUrlSchema = z.object({
  fileName: z.string().trim(),

  mimeType: z.string().trim(),
});

export class GetUploadUrlRequestDto extends createZodDto(getUploadUrlSchema) {}
