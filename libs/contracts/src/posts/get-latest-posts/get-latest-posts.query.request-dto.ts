import z from 'zod';
import { CommonSchemas } from '@snaptix/contracts/schemas';
import { createZodDto } from 'nestjs-zod';

const request = z.object({
  pageSize: CommonSchemas.pageSize.optional().default(4),
});

export class GetLatestPostsQueryRequestDto extends createZodDto(request) {}
