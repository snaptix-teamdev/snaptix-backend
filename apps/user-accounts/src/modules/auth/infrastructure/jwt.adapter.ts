import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../core/constants/auth-tokens.inject-constants';

export interface PayloadRefreshToken {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAdapter {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  createAccessToken(userId: string): string {
    return this.accessTokenContext.sign({ userId });
  }

  createRefreshToken(userId: string, deviceId: string): string {
    return this.refreshTokenContext.sign({ userId, deviceId });
  }

  decodeRefreshToken(token: string): PayloadRefreshToken {
    return this.refreshTokenContext.decode<PayloadRefreshToken>(token);
  }
}
