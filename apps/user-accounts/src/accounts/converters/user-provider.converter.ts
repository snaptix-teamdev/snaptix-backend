import { UniversalConverter } from '@snaptix/common';
import { UserProviderEntity } from '../domain/user-provider/user-provider.entity';
import { IUserProvider } from '@snaptix/common/interfaces/user-accounts/user-provider.interface';
import { Injectable } from '@nestjs/common';

const modelToEntity = (model: IUserProvider): UserProviderEntity => {
  return UserProviderEntity.restore(model);
};

const entityToModel = (entity: UserProviderEntity): IUserProvider => {
  return {
    id: entity.id,
    provider: entity.provider,
    externalProviderId: entity.externalProviderId,
    email: entity.email,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
    user: {
      id: entity.user.id,
      email: entity.user.email,
      username: entity.user.username,
      passwordHash: entity.user.passwordHash,
      updatedAt: entity.user.updatedAt,
      createdAt: entity.user.createdAt,
      deletedAt: entity.user.deletedAt,
      emailConfirmation: {
        id: entity.user.emailConfirmation.id,
        code: entity.user.emailConfirmation.code,
        isVerified: entity.user.emailConfirmation.isVerified,
        userId: entity.user.emailConfirmation.userId,
        expiresAt: entity.user.emailConfirmation.expiresAt,
        createdAt: entity.user.emailConfirmation.createdAt,
        updatedAt: entity.user.emailConfirmation.updatedAt,
      },
      recoveryPassword: entity.user.recoveryPassword
        ? {
            id: entity.user.recoveryPassword.id,
            userId: entity.user.recoveryPassword.userId,
            code: entity.user.recoveryPassword.code,
            isCodeAlreadyUsed: entity.user.recoveryPassword.isCodeAlreadyUsed,
            expiresAt: entity.user.recoveryPassword.expiresAt,
            createdAt: entity.user.recoveryPassword.createdAt,
            updatedAt: entity.user.recoveryPassword.updatedAt,
          }
        : null,
    },
  };
};

@Injectable()
export class UserProviderConverter extends UniversalConverter<
  UserProviderEntity,
  IUserProvider
> {
  constructor() {
    super(modelToEntity, entityToModel);
  }
}
