import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  POST_EVENTS,
  PostDeletedEvent,
  POSTS_EXCHANGE,
} from '@snaptix/contracts';

@Injectable()
export class PostsEventPublisher {
  constructor(private amqpConnection: AmqpConnection) {}

  async postDeleted(event: PostDeletedEvent): Promise<void> {
    await this.amqpConnection.publish(
      POSTS_EXCHANGE,
      POST_EVENTS.POST_DELETED,
      event,
    );
  }
}
