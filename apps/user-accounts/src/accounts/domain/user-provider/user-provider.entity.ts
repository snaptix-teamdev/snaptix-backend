import { IUserProvider } from '@snaptix/common/interfaces/user-accounts/user-provider.interface';
import { OAuthProviderType } from '@snaptix/common';
import { UserEntity } from '../user/user.entity';
import { CreateUserProviderEntityDto } from './dto/create-user-provider.entity-dto';

export class UserProviderEntity implements IUserProvider {
  id: string;
  provider: OAuthProviderType;
  externalProviderId: string;
  email: string;
  user: UserEntity;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  static create(dto: CreateUserProviderEntityDto): UserProviderEntity {
    const entity = new UserProviderEntity();

    entity.provider = dto.provider;
    entity.externalProviderId = dto.externalProviderId;
    entity.email = dto.email;
    entity.user = dto.user;
    entity.deletedAt = null;

    return entity;
  }

  static restore(model: IUserProvider): UserProviderEntity {
    const entity = new UserProviderEntity();

    Object.assign(entity, {
      ...model,
      user: UserEntity.restore(model.user),
    });

    return entity;
  }

  update(externalProviderId: string, email: string): void {
    this.externalProviderId = externalProviderId;
    this.email = email;
  }

  changeEmail(email: string): void {
    this.email = email;
  }
}
