import { AUTH_PATTERNS } from '@snaptix/contracts/constants/patterns/user-accounts/auth.patterns';

export const USER_ACCOUNTS_PATTERNS = {
  AUTH: { ...AUTH_PATTERNS },
} as const;
