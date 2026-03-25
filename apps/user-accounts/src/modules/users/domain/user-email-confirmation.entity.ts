import { IUserEmailConfirmation } from '@snaptix/common';

export class UserEmailConfirmationEntity implements IUserEmailConfirmation {
  id: string;
  code: string;
  isVerified: boolean;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  private constructor() {}

  static create(): UserEmailConfirmationEntity {
    const entity = new UserEmailConfirmationEntity();
    entity.isVerified = false;
    entity.expiresAt = new Date();
    return entity;
  }

  static restore(model: IUserEmailConfirmation): UserEmailConfirmationEntity {
    const entity = new UserEmailConfirmationEntity();
    Object.assign(entity, model);
    return entity;
  }
}
