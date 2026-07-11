import { OAuthProviderType } from '@snaptix/common';

export class CallbackGooglePayload {
  email: string;
  externalProviderId: string;
  provider: OAuthProviderType;
  ip: string | null;
  userAgent: string;
}
