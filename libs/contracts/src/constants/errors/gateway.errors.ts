import { IDomainError } from '@snaptix/common';

export const GATEWAY_ERRORS = {
  RECAPTCHA_INVALID: {
    code: 'RECAPTCHA_INVALID',
    message: 'Incorrect recaptcha',
    httpCode: 400,
    field: 'recaptchaToken',
  },
} satisfies Record<
  string,
  IDomainError<{
    recaptchaToken: string;
  }>
>;
