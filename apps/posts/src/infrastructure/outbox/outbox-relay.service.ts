import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TransactionManager } from '../prisma/transaction.manager';
import { OutboxEventRepository } from './outbox-event.repository';

@Injectable()
export class OutboxRelayService {
  constructor(
    private transactionManager: TransactionManager,
    private outboxEventRepository: OutboxEventRepository,
    private amqpConnection: AmqpConnection,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processOutboxEvents(): Promise<void> {
    await this.transactionManager.run(async (tx) => {
      const events = await this.outboxEventRepository.findUnpublished(10, tx);

      for (const event of events) {
        await this.amqpConnection.publish(
          event.exchange,
          event.type,
          event.payload,
        );
        await this.outboxEventRepository.markPublished(event.id, tx);
      }
    });
  }
}
