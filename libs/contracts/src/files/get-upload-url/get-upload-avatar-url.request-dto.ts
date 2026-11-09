import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const requestSchema = z.object({
  fileName: z.string().trim().min(5).max(255),
  mimeType: z.enum(
    ['image/jpeg', 'image/png'],
    'Only JPEG and PNG are allowed',
  ),
  contentLengthBytes: z
    .number()
    .min(1024)
    .max(1024 * 1024 * 10), // 10MiB
});

export class GetUploadAvatarUrlRequestDto extends createZodDto(requestSchema) {}
