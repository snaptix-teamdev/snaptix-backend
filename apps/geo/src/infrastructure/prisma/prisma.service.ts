import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaConfig } from './prisma.config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(prismaConfig: PrismaConfig) {
    const adapter = new PrismaPg({
      connectionString: prismaConfig.postgresGeoUrl,
    });
    super({ adapter });
  }
}
