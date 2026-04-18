import {
  IUserEmailConfirmation,
  IUserRecoveryPassword,
} from '@snaptix/common/interfaces';

export interface IUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
  emailConfirmation: IUserEmailConfirmation;
  recoveryPassword: IUserRecoveryPassword | null;
}
