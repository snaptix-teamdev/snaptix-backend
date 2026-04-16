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

  async findByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<SessionEntity | null> {
    const model = await this.prisma.session.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });

    if (!model) return null;

    return this.sessionConverter.fromPrismaModelToEntity(model);
  }

  async update(entity: SessionEntity): Promise<void> {
    const model = this.sessionConverter.fromEntityToPrismaModel(entity);

    await this.prisma.session.update({
      where: { id: model.id },
      data: {
        ...model,
      },
    });
  }
}
