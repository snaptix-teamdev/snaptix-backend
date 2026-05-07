import { IUserRecoveryPassword } from '@snaptix/common';

export type CreateUserRecoveryPasswordDto = Pick<
  IUserRecoveryPassword,
  'userId'
>;
