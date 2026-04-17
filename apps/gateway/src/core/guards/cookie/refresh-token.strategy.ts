import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CoreConfig } from '../../config/core.config';
import { RefreshTokenPayloadDto } from '@snaptix/contracts/tokens';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(private readonly coreConfig: CoreConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null =>
          typeof req?.cookies?.refreshToken === 'string'
            ? req?.cookies?.refreshToken
            : null,
      ]),
      ignoreExpiration: false,
      secretOrKey: coreConfig.refreshTokenSecret,
    });
  }

  validate(payload: RefreshTokenPayloadDto): RefreshTokenPayloadDto {
    return payload;
  }
}
