import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { OutboxModule } from './outbox/outbox.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    RabbitmqModule,
    OutboxModule,
  ],
})
export class InfrastructureModule {}
