import z from 'zod';
import { CommonSchemas } from '@snaptix/contracts/schemas';
import { createZodDto } from 'nestjs-zod';

const payload = z.object({
  userId: CommonSchemas.uuid,
  cursorId: CommonSchemas.uuid.optional(),
  pageSize: CommonSchemas.pageSize.optional(),
});

export class GetMyPostsPayload extends createZodDto(payload) {}
