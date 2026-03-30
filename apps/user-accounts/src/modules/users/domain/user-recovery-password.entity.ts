import { IUserRecoveryPassword } from '@snaptix/common';

export class UserRecoveryPasswordEntity implements IUserRecoveryPassword {
  id: string;
  code: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;

  private constructor() {}

  static create(): UserRecoveryPasswordEntity {
    return new UserRecoveryPasswordEntity();
  }

  static restore(model: IUserRecoveryPassword): UserRecoveryPasswordEntity {
    const entity = new UserRecoveryPasswordEntity();
    Object.assign(entity, model);
    return entity;
  }
}
