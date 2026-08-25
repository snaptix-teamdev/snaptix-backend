import { AUTH_PATTERNS } from '@snaptix/contracts/constants/patterns/user-accounts/auth.patterns';
import { SECURITY_DEVICES_PATTERNS } from '@snaptix/contracts/constants/patterns/user-accounts/security-devices.patterns';
import { USERS_PATTERNS } from '@snaptix/contracts/constants/patterns/user-accounts/users.patterns';
import { PROFILE_PATTERNS } from '@snaptix/contracts/constants/patterns/user-accounts/profile.patterns';

export const USER_ACCOUNTS_PATTERNS = {
  AUTH: { ...AUTH_PATTERNS },
  SECURITY_DEVICES: { ...SECURITY_DEVICES_PATTERNS },
  USERS: { ...USERS_PATTERNS },
  PROFILE: { ...PROFILE_PATTERNS },
} as const;
