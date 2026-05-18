import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts/constants/errors/user-accounts.errors';
import { COMMON_ERRORS } from '@snaptix/contracts/constants/errors/common.errors';
import { POSTS_ERRORS } from '@snaptix/contracts/constants/errors/posts.errors';
import { FILES_ERRORS } from '@snaptix/contracts/constants/errors/files.errors';

export const ERRORS = {
  ...COMMON_ERRORS,
  ...USER_ACCOUNTS_ERRORS,
  ...POSTS_ERRORS,
  ...FILES_ERRORS,
};

export type ErrorCode = keyof typeof ERRORS;
