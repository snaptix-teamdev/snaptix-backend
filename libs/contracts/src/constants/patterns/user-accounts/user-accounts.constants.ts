import { AUTH_PATTERNS } from '@snaptix/contracts/constants/patterns/user-accounts/auth.patterns';
import { SECURITY_DEVICES_PATTERNS } from '@snaptix/contracts/constants/patterns/user-accounts/security-devices.patterns';

export const USER_ACCOUNTS_PATTERNS = {
  AUTH: { ...AUTH_PATTERNS },
  SECURITY_DEVICES: { ...SECURITY_DEVICES_PATTERNS },
} as const;
