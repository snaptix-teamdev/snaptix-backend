import { IDomainError } from '@snaptix/common';

export const GATEWAY_ERRORS = {
  RECAPTCHA_INVALID: {
    code: 'RECAPTCHA_INVALID',
    message: 'Incorrect recaptcha',
    httpCode: 401,
    field: 'recaptchaToken',
  },
  EMAIL_IS_MISSING: {
    code: 'EMAIL_IS_MISSING',
    message:
      'The external account did not provide the required data, email not received',
    httpCode: 409,
    field: null,
  },
} satisfies Record<
  string,
  IDomainError<{
    recaptchaToken: string;
  }>
>;
