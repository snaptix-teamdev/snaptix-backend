import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import {
  Environments,
  envNodeEnv,
  envPort,
  envString,
  zodConfigValidationUtility,
} from '@snaptix/common';

const coreSchema = z.object({
  PORT: envPort,
  NODE_ENV: envNodeEnv,
  RABBITMQ_URI: envString('amqp://username:password@localhost:5672'),
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
