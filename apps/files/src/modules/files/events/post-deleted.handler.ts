import {
  defaultNackErrorHandler,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PostDeletedEvent, POSTS_EXCHANGE } from '@snaptix/contracts';
import { POST_EVENTS } from '@snaptix/contracts/constants/events';
import { FILES_DEAD_LETTER_EXCHANGE } from '../../../core/rabbitmq.constants';
import { DeletePostFilesCommand } from '../application/commands/delete-post-files.use-case';
import { DomainEvent } from '@snaptix/common';

@Injectable()
export class PostDeletedHandler {
  private readonly logger = new Logger(PostDeletedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @RabbitSubscribe({
    exchange: POSTS_EXCHANGE,
    routingKey: POST_EVENTS.POST_DELETED,
    queue: 'files.posts.queue',
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': FILES_DEAD_LETTER_EXCHANGE,
        'x-dead-letter-routing-key': POST_EVENTS.POST_DELETED,
      },
    },
    errorHandler: defaultNackErrorHandler,
  })
  async handle(envelope: DomainEvent<PostDeletedEvent>): Promise<void> {
    const { data } = envelope;

    this.logger.debug(
      `Post deleted: postId=${data.postId}, eventId=${envelope.id}`,
    );

    await this.commandBus.execute(
      new DeletePostFilesCommand({ postId: data.postId, userId: data.userId }),
    );
  }
}
