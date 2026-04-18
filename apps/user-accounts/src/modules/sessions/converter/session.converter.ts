import { ISession, UniversalConverter } from '@snaptix/common';
import { SessionEntity } from '../domain/session.entity';
import { Injectable } from '@nestjs/common';

const modelToEntity = (model: ISession): SessionEntity => {
  return SessionEntity.restore(model);
};

const entityToModel = (entity: SessionEntity): ISession => {
  return {
    id: entity.id,
    userId: entity.userId,
    deviceId: entity.deviceId,
    deviceName: entity.deviceName,
    ip: entity.ip,
    issuedAt: entity.issuedAt,
    expiresAt: entity.expiresAt,
    createdAt: entity.createdAt,
  };
};

@Injectable()
export class SessionConverter extends UniversalConverter<
  SessionEntity,
  ISession
> {
  constructor() {
    super(modelToEntity, entityToModel);
  }
}
