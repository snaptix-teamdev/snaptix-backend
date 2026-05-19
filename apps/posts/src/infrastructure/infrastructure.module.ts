import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [PrismaModule, RabbitmqModule],
})
export class InfrastructureModule {}
