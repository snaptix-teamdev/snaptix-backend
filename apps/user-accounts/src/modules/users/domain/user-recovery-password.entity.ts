import { IUserRecoveryPassword } from '@snaptix/common';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';

export class UserRecoveryPasswordEntity implements IUserRecoveryPassword {
  id: string;
  code: string;
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
    this.expiresAt = add(new Date(), {
      hours: passwordResetCodeTtlHours,
    });
  }
}
