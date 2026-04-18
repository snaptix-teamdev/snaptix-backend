import { IUserEmailConfirmation } from '@snaptix/common';

export type CreateUserEmailConfirmationDto = Pick<
  IUserEmailConfirmation,
  'expiresAt'
>;
