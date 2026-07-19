import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { GatewayConfig } from '../../../modules/gateway/gateway.config';
import { Injectable } from '@nestjs/common';
import {
  DomainException,
  OAuthProviderType,
  UserOAuthContextDto,
} from '@snaptix/common';
import { GATEWAY_ERRORS } from '@snaptix/contracts';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly gatewayConfig: GatewayConfig) {
    super({
      clientID: gatewayConfig.googleClientId,
      clientSecret: gatewayConfig.googleClientSecret,
      callbackURL: gatewayConfig.googleCallbackUrl,
      scope: ['email', 'profile'],
      state: false, // TODO: Enable OAuth state validation (CSRF protection) using Redis-backed state storage or express-session.
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): UserOAuthContextDto {
    const emailEntry = profile.emails?.[0];

    if (!emailEntry?.value) {
      throw new DomainException(GATEWAY_ERRORS.EMAIL_IS_MISSING);
    }

    if (!emailEntry.verified) {
      throw new DomainException(GATEWAY_ERRORS.EMAIL_NOT_VERIFIED_BY_PROVIDER);
    }

    return {
      email: emailEntry.value,
      externalProviderId: profile.id,
      provider: OAuthProviderType.GOOGLE,
    };
  }
}
