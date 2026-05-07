import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CommonSchemas } from '@snaptix/contracts/schemas';

const payload = z.object({
  id: CommonSchemas.uuid,
});

export class GetPostByIdPayload extends createZodDto(payload) {}
