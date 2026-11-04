import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { zodConfigValidationUtility } from '@snaptix/common';

const prismaSchema = z.object({
  POSTGRES_BILLING_URL: z.string().min(1),
});

type PrismaSchemaType = z.infer<typeof prismaSchema>;

@Injectable()
export class PrismaConfig implements PrismaSchemaType {
  POSTGRES_BILLING_URL: string;

  constructor() {
    Object.assign(this, zodConfigValidationUtility(prismaSchema));
  }
}
