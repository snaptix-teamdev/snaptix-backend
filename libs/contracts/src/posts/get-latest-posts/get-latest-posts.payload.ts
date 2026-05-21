import { CommonSchemas } from '@snaptix/contracts/schemas';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const payload = z.object({
  pageSize: CommonSchemas.pageSize,
});

export class GetLatestPostsPayload extends createZodDto(payload) {}
