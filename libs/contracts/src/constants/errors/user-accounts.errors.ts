import {
  IDomainError,
  ISession,
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
  USER_EMAIL_NOT_CONFIRMED: {
    code: 'USER_EMAIL_NOT_CONFIRMED',
    message: 'User email not confirmed',
    httpCode: 403,
    field: 'email',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    httpCode: 404,
    field: 'id',
  },
  USER_PASSWORD_RECOVERY_CODE_NOT_FOUND: {
    code: 'USER_PASSWORD_RECOVERY_CODE_NOT_FOUND',
    message: 'User password recovery code not found',
    httpCode: 404,
    field: 'code',
  },
  USER_PASSWORD_RECOVERY_CODE_EXPIRED: {
    code: 'USER_PASSWORD_RECOVERY_CODE_EXPIRED',
    message: 'User password recovery code expired',
    httpCode: 409,
    field: 'code',
  },
  USER_PASSWORD_RECOVERY_CODE_ALREADY_USED: {
    code: 'USER_PASSWORD_RECOVERY_CODE_ALREADY_USED',
    message: 'User password recovery code already used',
    httpCode: 409,
    field: 'code',
  },
  SESSION_NOT_FOUND: {
    code: 'SESSION_NOT_FOUND',
    message: 'Session not found',
    httpCode: 404,
    field: 'deviceId',
  },
  USER_IS_DELETED: {
    code: 'USER_IS_DELETED',
    message:
      'The account associated with the data from the external account has been deleted or blocked',
    httpCode: 403,
    field: null,
  },
} satisfies Record<
  string,
  IDomainError<
    IUser | IUserEmailConfirmation | IUserRecoveryPassword | ISession
  >
>;
