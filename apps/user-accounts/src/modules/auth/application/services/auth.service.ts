import { Injectable } from '@nestjs/common';
import { JwtAdapter } from '../../infrastructure/jwt.adapter';
import { RefreshTokenPayloadDto } from '@snaptix/contracts/tokens';

export interface GenerateTokensResult {
  accessToken: string;
  refreshToken: string;
  refreshTokenIssuedAt: Date;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(private jwtAdapter: JwtAdapter) {}

  generateTokens(payload: {
    userId: string;
    deviceId: string;
  }): GenerateTokensResult {
    const accessToken = this.jwtAdapter.createAccessToken(payload.userId);
    const refreshToken = this.jwtAdapter.createRefreshToken(
      payload.userId,
      payload.deviceId,
    );

    const refreshTokenPayload: RefreshTokenPayloadDto =
      this.jwtAdapter.decodeRefreshToken(refreshToken);

    return {
      accessToken,
      refreshToken,
      refreshTokenIssuedAt: new Date(refreshTokenPayload.iat * 1000),
      refreshTokenExpiresAt: new Date(refreshTokenPayload.exp * 1000),
    };
  }
}
