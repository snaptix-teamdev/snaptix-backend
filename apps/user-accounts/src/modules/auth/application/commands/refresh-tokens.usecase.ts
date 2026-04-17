import {
  Command,
  CommandBus,
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AccessAndRefreshTokensDto } from '@snaptix/contracts/tokens';

import { UpdateSessionCommand } from '../../../sessions/application/commands/update-session.usecase';
import { JwtAdapter } from '../../infrastructure/jwt.adapter';
import { DomainException } from '@snaptix/common';
import { COMMON_ERRORS } from '@snaptix/contracts';
import { AuthService, GenerateTokensResult } from '../services/auth.service';
import { buildDeviceInfo } from '../helpers/build-device-info.helper';

class RefreshTokensCommandRequest {
  refreshToken: string;
  ip: string | null;
  userAgent: string;
}

export class RefreshTokensCommand extends Command<AccessAndRefreshTokensDto> {
  constructor(public payload: RefreshTokensCommandRequest) {
    super();
  }
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase implements ICommandHandler<
  RefreshTokensCommand,
  AccessAndRefreshTokensDto
> {
  constructor(
    private commandBus: CommandBus,
    private authService: AuthService,
    private jwtAdapter: JwtAdapter,
  ) {}

  async execute({
    payload,
  }: RefreshTokensCommand): Promise<AccessAndRefreshTokensDto> {
    const refreshTokenPayload = this.jwtAdapter.verifyRefreshToken(
      payload.refreshToken,
    );

    if (!refreshTokenPayload) {
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    const tokens: GenerateTokensResult = this.authService.generateTokens({
      userId: refreshTokenPayload.userId,
      deviceId: refreshTokenPayload.deviceId,
    });

    const deviceName = buildDeviceInfo(payload.userAgent);

    await this.commandBus.execute(
      new UpdateSessionCommand({
        userId: refreshTokenPayload.userId,
        deviceId: refreshTokenPayload.deviceId,
        ip: payload.ip,
        deviceName,
        issuedAt: tokens.refreshTokenIssuedAt,
        expiresAt: tokens.refreshTokenExpiresAt,
      }),
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
