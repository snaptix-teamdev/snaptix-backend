import { UniversalConverter } from '@snaptix/common';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../domain/user/user.entity';
import {
  requireLoadedUser,
  UserPrismaModel,
} from '../../infrastructure/prisma/models/user.prisma-model';
import { Prisma } from '../../generated/prisma/client';
import { UserEmailConfirmationEntity } from '../domain/user/user-email-confirmation.entity';
import { UserRecoveryPasswordEntity } from '../domain/user/user-recovery-password.entity';

const modelToEntity = (model: UserPrismaModel): UserEntity => {
  return UserEntity.restore(requireLoadedUser(model));
};

const emailConfirmationData = (
  entity: UserEmailConfirmationEntity,
): Prisma.UserEmailConfirmationCreateWithoutUserInput => ({
  code: entity.code,
  isVerified: entity.isVerified,
  expiresAt: entity.expiresAt,
});

const recoveryPasswordData = (
  entity: UserRecoveryPasswordEntity,
): Prisma.UserRecoveryPasswordCreateWithoutUserInput => ({
  code: entity.code,
  isCodeAlreadyUsed: entity.isCodeAlreadyUsed,
  expiresAt: entity.expiresAt,
});

const entityToCreateInput = (entity: UserEntity): Prisma.UserCreateInput => ({
  email: entity.email,
  username: entity.username,
  passwordHash: entity.passwordHash,
  deletedAt: entity.deletedAt,
  emailConfirmation: {
    create: emailConfirmationData(entity.emailConfirmation),
  },
  recoveryPassword: entity.recoveryPassword
    ? { create: recoveryPasswordData(entity.recoveryPassword) }
    : undefined,
});

@Injectable()
export class UserConverter extends UniversalConverter<
  UserEntity,
  UserPrismaModel,
  Prisma.UserCreateInput
> {
  constructor() {
    super(modelToEntity, entityToCreateInput);
  }

  fromEntityToUpdateInput(entity: UserEntity): Prisma.UserUpdateInput {
    const recoveryPassword = entity.recoveryPassword
      ? recoveryPasswordData(entity.recoveryPassword)
      : null;

    return {
      email: entity.email,
      username: entity.username,
      passwordHash: entity.passwordHash,
      deletedAt: entity.deletedAt,
      emailConfirmation: {
        update: emailConfirmationData(entity.emailConfirmation),
      },
      recoveryPassword: recoveryPassword
        ? {
            upsert: {
              create: recoveryPassword,
              update: recoveryPassword,
            },
          }
        : undefined,
    };
  }
}
