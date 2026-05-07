import { ISession } from '@snaptix/common';
import { CreateSessionEntityDto } from './dto/create-session.entity-dto';
import { UpdateSessionEntityDto } from './dto/update-session.entity-dto';

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

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isIssuedAtEqual(issuedAt: Date): boolean {
    return this.issuedAt.getTime() === issuedAt.getTime();
  }

  update(dto: UpdateSessionEntityDto): void {
    if (this.ip !== undefined) this.ip = dto.ip;
    if (this.issuedAt !== undefined) this.issuedAt = dto.issuedAt;
    if (this.expiresAt !== undefined) this.expiresAt = dto.expiresAt;
  }
}
