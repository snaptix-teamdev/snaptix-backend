import { UniversalConverter } from '@snaptix/common';
import { UserProviderEntity } from '../domain/user-provider/user-provider.entity';
import { Injectable } from '@nestjs/common';
import { UserProviderPrismaModel } from '../../infrastructure/prisma/models/user-provider.prisma-model';
import { requireLoadedUser } from '../../infrastructure/prisma/models/user.prisma-model';
import { Prisma } from '../../generated/prisma/client';

const modelToEntity = (model: UserProviderPrismaModel): UserProviderEntity => {
  return UserProviderEntity.restore({
    ...model,
    user: requireLoadedUser(model.user),
  });
};

const entityToCreateInput = (
  entity: UserProviderEntity,
): Prisma.UserProviderCreateInput => ({
  provider: entity.provider,
  externalProviderId: entity.externalProviderId,
  email: entity.email,
  deletedAt: entity.deletedAt,
  user: { connect: { id: entity.user.id } },
});

@Injectable()
export class UserProviderConverter extends UniversalConverter<
  UserProviderEntity,
  UserProviderPrismaModel,
  Prisma.UserProviderCreateInput
> {
  constructor() {
    super(modelToEntity, entityToCreateInput);
  }
}
