import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

type OutboxEventRow = {
  id: string;
  type: string;
  exchange: string;
  payload: unknown;
};

@Injectable()
export class OutboxEventRepository {
  constructor() {}

  async create(
    data: { type: string; exchange: string; payload: object },
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.outboxEvent.create({ data });
  }

  async findUnpublished(
    limit: number,
    tx: Prisma.TransactionClient,
  ): Promise<OutboxEventRow[]> {
    return tx.$queryRaw<OutboxEventRow[]>`
      SELECT id, type, exchange, payload
      FROM outbox_event
      WHERE published_at IS NULL
      ORDER BY created_at
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    `;
  }

  async markPublished(id: string, tx: Prisma.TransactionClient): Promise<void> {
    await tx.outboxEvent.update({
      where: { id },
      data: { publishedAt: new Date() },
    });
  }
}
