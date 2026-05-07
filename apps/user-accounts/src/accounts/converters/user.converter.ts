import { IUser, UniversalConverter } from '@snaptix/common';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../domain/user/user.entity';

const modelToEntity = (model: IUser): UserEntity => {
  if (!model.emailConfirmation) {
    throw new Error(`User ${model.id} missing required relations`);
  }

  return UserEntity.restore(model);
};

const entityToModel = (entity: UserEntity): IUser => {
  return {
    id: entity.id,
    email: entity.email,
    username: entity.username,
    passwordHash: entity.passwordHash,
    updatedAt: entity.updatedAt,
    createdAt: entity.createdAt,
    deletedAt: entity.deletedAt,
    emailConfirmation: entity.emailConfirmation,
    recoveryPassword: entity.recoveryPassword,
  };
};

@Injectable()
export class UserConverter extends UniversalConverter<UserEntity, IUser> {
  constructor() {
    super(modelToEntity, entityToModel);
  }
}
