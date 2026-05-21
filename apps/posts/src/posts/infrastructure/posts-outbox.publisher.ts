import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  MICROSERVICE_NAME,
  POST_EVENTS,
  PostDeletedEvent,
  POSTS_EXCHANGE,
} from '@snaptix/contracts';
import { Prisma } from '../../generated/prisma/client';
import { OutboxEventRepository } from '../../infrastructure/outbox/outbox-event.repository';
import { DomainEvent } from '@snaptix/common';

@Injectable()
export class PostsOutboxPublisher {
  constructor(private outboxEventRepository: OutboxEventRepository) {}

  postDeleted(
    data: PostDeletedEvent,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const envelope: DomainEvent<PostDeletedEvent> = {
      specversion: '1.0',
      id: randomUUID(),
      type: POST_EVENTS.POST_DELETED,
      source: MICROSERVICE_NAME.POSTS,
      time: new Date().toISOString(),
      datacontenttype: 'application/json',
      data,
    };

    return this.outboxEventRepository.create(
      {
        type: POST_EVENTS.POST_DELETED,
        exchange: POSTS_EXCHANGE,
        payload: envelope,
      },
      tx,
    );
  }
}
