import { Injectable, Logger } from '@nestjs/common';
import { RefreshTokenPayloadDto } from '@snaptix/contracts/tokens';
import { DomainException } from '@snaptix/common';
import { COMMON_ERRORS } from '@snaptix/contracts';
import { SessionEntity } from '../../domain/session/session.entity';
import { JwtAdapter } from '../../../infrastructure/jwt.adapter';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';

export interface GenerateTokensResult {
  accessToken: string;
  refreshToken: string;
  refreshTokenIssuedAt: Date;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class TokensService {
  private logger = new Logger(TokensService.name);

  constructor(
    private jwtAdapter: JwtAdapter,
    private sessionsRepository: SessionsRepository,
  ) {}

  async validateRefreshTokenOrThrow(
    refreshToken: string,
  ): Promise<SessionEntity> {
    const payload = this.jwtAdapter.verifyRefreshToken(refreshToken);

    if (!payload) {
      this.logger.debug('Refresh token is not valid');
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    const session = await this.sessionsRepository.findByUserIdAndDeviceId(
      payload.userId,
      payload.deviceId,
    );

    if (!session) {
      this.logger.debug('session not found by user id and device id');
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    if (session.isExpired()) {
      this.logger.debug('session is expired');
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    const oldIssuedAt = new Date(payload.iat * 1000);
    if (!session.isIssuedAtEqual(oldIssuedAt)) {
      this.logger.debug('session issued at is not equal to old issued at');
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    return session;
  }

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
