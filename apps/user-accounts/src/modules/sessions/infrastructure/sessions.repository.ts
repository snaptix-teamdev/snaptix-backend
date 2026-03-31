import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { SessionConverter } from '../converter/session.converter';
import { SessionEntity } from '../domain/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    private prisma: PrismaService,
    private sessionConverter: SessionConverter,
  ) {}

  async create(entity: SessionEntity): Promise<void> {
    const model = this.sessionConverter.fromEntityToPrismaModel(entity);

    await this.prisma.session.create({
      data: {
        ...model,
      },
    });
  }
}
