import { IUser } from '@snaptix/common';
import { UserEmailConfirmationEntity } from './user-email-confirmation.entity';
import { UserRecoveryPasswordEntity } from './user-recovery-password.entity';
import { CreateUserDto } from './dto/user.dto';

export class UserEntity implements IUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string | null;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
  emailConfirmation: UserEmailConfirmationEntity;
  recoveryPassword: UserRecoveryPasswordEntity | null;

  private constructor() {}

  static create(
    dto: CreateUserDto,
    emailConfirmationCodeLifetimeInHours: number,
  ): UserEntity {
    const entity = new UserEntity();

    entity.email = dto.email;
    entity.username = dto.username;
    entity.passwordHash = dto.passwordHash;
    entity.deletedAt = null;
    entity.emailConfirmation = UserEmailConfirmationEntity.create(
      emailConfirmationCodeLifetimeInHours,
    );
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

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  isEmailConfirmationCodeExpired(): boolean {
    return this.emailConfirmation.isEmailConfirmationCodeExpired();
  }

  isEmailVerified(): boolean {
    return this.emailConfirmation.isEmailConfirmationCodeVerified();
  }

  confirmEmailByCode(code: string): void {
    this.emailConfirmation.confirmEmailByCode(code);
  }

  confirmEmailByOAuthProvider(): void {
    this.emailConfirmation.confirmEmailByOAuthProvider();
  }

  createPasswordRecoveryCode(passwordResetCodeTtlHours: number): string {
    if (this.recoveryPassword) {
      this.recoveryPassword.generateRecoveryCode(passwordResetCodeTtlHours);
    } else {
      this.recoveryPassword = UserRecoveryPasswordEntity.create({
        userId: this.id,
        passwordResetCodeTtlHours,
      });
    }

    return this.recoveryPassword.code;
  }

  isPasswordRecoveryCodeExpired(): boolean {
    if (!this.recoveryPassword) {
      throw new Error('user does not have recovery password');
    }

    return this.recoveryPassword.isPasswordRecoveryCodeExpired();
  }

  isPasswordRecoveryCodeAlreadyUsed(): boolean {
    if (!this.recoveryPassword) {
      throw new Error('user does not have recovery password');
    }

    return this.recoveryPassword.isPasswordRecoveryCodeAlreadyUsed();
  }

  resetPasswordByRecoveryCode(payload: {
    code: string;
    newPasswordHash: string;
  }): void {
    if (!this.recoveryPassword) {
      throw new Error('user does not have recovery password');
    }

    this.recoveryPassword.markRecoveryPasswordCodeAsUsed(payload.code);
    this.passwordHash = payload.newPasswordHash;
  }

  generateEmailConfirmationCode(
    emailConfirmationCodeLifetimeInHours: number,
  ): string {
    return this.emailConfirmation.generateCode(
      emailConfirmationCodeLifetimeInHours,
    );
  }
}
