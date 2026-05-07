import { IUserRecoveryPassword } from '@snaptix/common';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';

export class UserRecoveryPasswordEntity implements IUserRecoveryPassword {
  id: string;
  code: string;
  isCodeAlreadyUsed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;

  private constructor() {}

  static create(payload: {
    userId: string;
    passwordResetCodeTtlHours: number;
  }): UserRecoveryPasswordEntity {
    const entity = new UserRecoveryPasswordEntity();

    entity.userId = payload.userId;
    entity.code = randomUUID();
    entity.isCodeAlreadyUsed = false;
    entity.expiresAt = add(new Date(), {
      hours: payload.passwordResetCodeTtlHours,
    });

    return entity;
  }

  static restore(model: IUserRecoveryPassword): UserRecoveryPasswordEntity {
    const entity = new UserRecoveryPasswordEntity();
    Object.assign(entity, model);
    return entity;
  }

  generateRecoveryCode(passwordResetCodeTtlHours: number): void {
    this.code = randomUUID();
    this.isCodeAlreadyUsed = false;
    this.expiresAt = add(new Date(), {
      hours: passwordResetCodeTtlHours,
    });
  }

  isPasswordRecoveryCodeExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isPasswordRecoveryCodeAlreadyUsed(): boolean {
    return this.isCodeAlreadyUsed;
  }

  isPasswordCanBeResetByCode(): boolean {
    return (
      !this.isPasswordRecoveryCodeExpired() &&
      !this.isPasswordRecoveryCodeAlreadyUsed()
    );
  }

  markRecoveryPasswordCodeAsUsed(code: string): void {
    if (!this.isPasswordCanBeResetByCode())
      throw new Error(`recovery code already used or expired`);
    if (this.code !== code) throw new Error(`invalid reset password code`);

    this.isCodeAlreadyUsed = true;
  }
}
