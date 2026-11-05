import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { envString, zodConfigValidationUtility } from '@snaptix/common';

const prismaSchema = z.object({
  POSTGRES_BILLING_URL: envString(
    'postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public',
  ),
});

type PrismaSchemaType = z.infer<typeof prismaSchema>;

@Injectable()
export class PrismaConfig implements PrismaSchemaType {
  POSTGRES_BILLING_URL: string;

  constructor() {
    Object.assign(this, zodConfigValidationUtility(prismaSchema));
  }
}
