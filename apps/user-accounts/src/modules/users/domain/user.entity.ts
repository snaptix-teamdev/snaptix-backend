import { IUser } from '@snaptix/common';
import { UserEmailConfirmationEntity } from './user-email-confirmation.entity';
import { UserRecoveryPasswordEntity } from './user-recovery-password.entity';
import { CreateUserDto } from './dto/user.dto';

export class UserEntity implements IUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
  emailConfirmation: UserEmailConfirmationEntity;
  recoveryPassword: UserRecoveryPasswordEntity | null;

  private constructor() {}

  static create(dto: CreateUserDto): UserEntity {
    const entity = new UserEntity();

    entity.email = dto.email;
    entity.username = dto.username;
    entity.passwordHash = dto.passwordHash;
    entity.deletedAt = null;
    entity.emailConfirmation = UserEmailConfirmationEntity.create();
    entity.recoveryPassword = null;

    return entity;
  }

  static restore(model: IUser): UserEntity {
    const entity = new UserEntity();

    Object.assign(entity, {
      ...model,
      emailConfirmation: UserEmailConfirmationEntity.restore(
        model.emailConfirmation,
      ),
      recoveryPassword: model.recoveryPassword
        ? UserRecoveryPasswordEntity.restore(model.recoveryPassword)
        : null,
    });

    return entity;
  }
}
