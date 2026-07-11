import { OAuthProviderType } from '@snaptix/common';

export class UserContextDto {
  userId: string;
}

export class UserOptionalContextDto {
  userId: string | null;
}

export class UserOAuthContextDto {
  email: string;
  externalProviderId: string;
  provider: OAuthProviderType;
}
