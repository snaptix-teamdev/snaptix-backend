import z from 'zod';
import { CommonSchemas } from '@snaptix/contracts/schemas';
import { createZodDto } from 'nestjs-zod';

const request = z.object({
  cursorId: CommonSchemas.uuid.optional(),
  pageSize: CommonSchemas.pageSize.optional(),
});

export class GetUserPostsRequestDto extends createZodDto(request) {}
