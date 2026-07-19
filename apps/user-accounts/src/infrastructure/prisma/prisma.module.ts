import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaConfig } from './prisma.config';
import { TransactionManager } from './transaction.manager';

@Global()
@Module({
  providers: [PrismaService, PrismaConfig, TransactionManager],
  exports: [PrismaService, TransactionManager],
})
export class PrismaModule {}
