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
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): UserOAuthContextDto {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);

    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new DomainException(GATEWAY_ERRORS.EMAIL_IS_MISSING);
    }

    return {
      email,
      externalProviderId: profile.id,
      provider: OAuthProviderType.GOOGLE,
    };
  }
}
