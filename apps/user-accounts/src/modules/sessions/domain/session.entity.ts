import { ISession } from '@snaptix/common';
import { CreateSessionEntityDto } from './dto/create-session.entity-dto';

export class SessionEntity implements ISession {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string | null;
  issuedAt: Date;
  expiresAt: Date;
  createdAt: Date;

  private constructor() {}

  static create(dto: CreateSessionEntityDto): SessionEntity {
    const entity = new SessionEntity();

    entity.userId = dto.userId;
    entity.deviceId = dto.deviceId;
    entity.deviceName = dto.deviceName;
    entity.ip = dto.ip;
    entity.issuedAt = dto.issuedAt;
    entity.expiresAt = dto.expiresAt;

    return entity;
  }

  static restore(model: ISession): SessionEntity {
    const entity = new SessionEntity();

    Object.assign(entity, {
      ...model,
    });

    return entity;
  }
}
