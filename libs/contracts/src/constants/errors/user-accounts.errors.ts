export const USER_ACCOUNTS_ERRORS = {
  USER_EMAIL_ALREADY_EXISTS: {
    code: 'USER_EMAIL_ALREADY_EXISTS',
    message: 'User with current email already exists',
    httpCode: 400,
  },
  USER_USERNAME_ALREADY_EXISTS: {
    code: 'USER_USERNAME_ALREADY_EXISTS',
    message: 'User with current username already exists',
    httpCode: 400,
  },
} as const;
