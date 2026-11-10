import { z } from 'zod';
import { CommonSchemas } from '@snaptix/contracts/schemas';
import { createZodDto } from 'nestjs-zod';

const addAvatarSchema = z.object({
  fileId: CommonSchemas.uuid,
});

export class AddAvatarRequestDto extends createZodDto(addAvatarSchema) {}
