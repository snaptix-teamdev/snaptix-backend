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
    user: entity.user,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
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
