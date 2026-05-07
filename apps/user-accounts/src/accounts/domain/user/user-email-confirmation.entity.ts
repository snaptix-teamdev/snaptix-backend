import { IUserEmailConfirmation } from '@snaptix/common';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';

export class UserEmailConfirmationEntity implements IUserEmailConfirmation {
  id: string;
  code: string;
  isVerified: boolean;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  private constructor() {}

  static create(
    emailConfirmationCodeLifetimeInHours: number,
  ): UserEmailConfirmationEntity {
    const entity = new UserEmailConfirmationEntity();

    entity.isVerified = false;
    entity.generateCode(emailConfirmationCodeLifetimeInHours);

    return entity;
  }

  static restore(model: IUserEmailConfirmation): UserEmailConfirmationEntity {
    const entity = new UserEmailConfirmationEntity();
    Object.assign(entity, model);
    return entity;
  }

  isEmailConfirmationCodeExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isEmailConfirmationCodeVerified(): boolean {
    return this.isVerified;
  }

  isEmailCanBeConfirmed(): boolean {
    return (
      !this.isEmailConfirmationCodeVerified() &&
      !this.isEmailConfirmationCodeExpired()
    );
  }

  confirmEmail(code: string): void {
    if (!this.isEmailCanBeConfirmed())
      throw new Error(`email already confirmed or expired email code`);
    if (this.code !== code) throw new Error(`invalid email confirmation code`);

    this.isVerified = true;
  }

  generateCode(emailConfirmationCodeLifetimeInHours: number): string {
    this.code = randomUUID();
    this.expiresAt = add(new Date(), {
      hours: emailConfirmationCodeLifetimeInHours,
    });

    return this.code;
  }
}
