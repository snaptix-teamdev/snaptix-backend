import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { PostDeletedEvent } from '@snaptix/contracts';
import { POST_EVENTS } from '@snaptix/contracts/constants/events';
import { FILES_DEAD_LETTER_EXCHANGE } from '../../../core/rabbitmq.constants';
import { DomainEvent } from '@snaptix/common';

@Injectable()
export class PostDeletedDeadLetterHandler {
  private readonly logger = new Logger(PostDeletedDeadLetterHandler.name);

  @RabbitSubscribe({
    exchange: FILES_DEAD_LETTER_EXCHANGE,
    routingKey: POST_EVENTS.POST_DELETED,
    queue: 'files.posts.dead-letter.queue',
    queueOptions: { durable: true },
  })
  handle(envelope: DomainEvent<PostDeletedEvent>, msg: ConsumeMessage): void {
    //TODO добавить алерты, записать в таблицу с неудачными эвентами
    const xDeath = msg.properties.headers?.['x-death']?.[0];

    this.logger.error('Dead letter: post.deleted', {
      eventId: envelope.id,
      postId: envelope.data?.postId,
      reason: xDeath?.reason,
      count: xDeath?.count,
    });
  }
}
