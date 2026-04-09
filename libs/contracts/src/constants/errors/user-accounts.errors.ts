import {
  IDomainError,
  IUser,
  IUserEmailConfirmation,
  IUserRecoveryPassword,
} from '@snaptix/common';

export const USER_ACCOUNTS_ERRORS = {
  USER_EMAIL_ALREADY_EXISTS: {
    code: 'USER_EMAIL_ALREADY_EXISTS',
    message: 'User with current email already exists',
    httpCode: 409,
    field: 'email',
  },
  USER_USERNAME_ALREADY_EXISTS: {
    code: 'USER_USERNAME_ALREADY_EXISTS',
    message: 'User with current username already exists',
    httpCode: 409,
    field: 'username',
  },
  EMAIL_CONFIRMATION_CODE_NOT_FOUND: {
    code: 'EMAIL_CONFIRMATION_CODE_NOT_FOUND',
    message: 'Email confirmation code not found',
    httpCode: 404,
    field: 'code',
  },
  EMAIL_CONFIRMATION_CODE_EXPIRED: {
    code: 'EMAIL_CONFIRMATION_CODE_EXPIRED',
    message: 'Email confirmation code expired',
    httpCode: 409,
    field: 'code',
  },
  EMAIL_ALREADY_CONFIRMED: {
    code: 'EMAIL_ALREADY_CONFIRMED',
    message: 'Email with current confirmation code already confirmed',
    httpCode: 409,
    field: 'code',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    httpCode: 404,
    field: 'id',
  },
} satisfies Record<
  string,
  IDomainError<IUser | IUserEmailConfirmation | IUserRecoveryPassword>
>;
