import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Environments, zodConfigValidationUtility } from '@snaptix/common';

const coreSchema = z.object({
  PORT: z.coerce.number().min(1),
  NODE_ENV: z.enum(Environments),
  RABBITMQ_URI: z.string().min(1),
});

type CoreSchemaType = z.infer<typeof coreSchema>;

@Injectable()
export class CoreConfig implements CoreSchemaType {
  PORT: number;
  NODE_ENV: Environments;
  RABBITMQ_URI: string;

  constructor() {
    Object.assign(this, zodConfigValidationUtility(coreSchema));
  }
}
