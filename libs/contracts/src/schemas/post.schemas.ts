import z from 'zod';

export namespace PostSchemas {
  export const mediaItem = z.object({ fileId: z.string().trim().uuid() });
  export const media = z.array(mediaItem).min(1).max(10);
  export const description = z.string().trim().min(0).max(500).nullable();
}
