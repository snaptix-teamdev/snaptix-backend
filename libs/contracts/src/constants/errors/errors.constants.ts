import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts/constants/errors/user-accounts.errors';
import { COMMON_ERRORS } from '@snaptix/contracts/constants/errors/common.errors';

export const ERRORS = {
  ...COMMON_ERRORS,
  ...USER_ACCOUNTS_ERRORS,
} as const;

export type ErrorCode = keyof typeof ERRORS;
