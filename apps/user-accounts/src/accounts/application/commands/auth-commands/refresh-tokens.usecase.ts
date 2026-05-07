import {
  Command,
  CommandBus,
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AccessAndRefreshTokensDto } from '@snaptix/contracts/tokens';

import { UpdateSessionCommand } from '../session-commands/update-session.usecase';
import { DomainException } from '@snaptix/common';
import { COMMON_ERRORS } from '@snaptix/contracts';
import {
  TokensService,
  GenerateTokensResult,
} from '../../services/tokens.service';
import { Logger } from '@nestjs/common';
import { JwtAdapter } from '../../../../infrastructure/jwt.adapter';

class RefreshTokensCommandRequest {
  refreshToken: string;
  ip: string | null;
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
  private logger = new Logger(RefreshTokensUseCase.name);

  constructor(
    private commandBus: CommandBus,
    private tokensService: TokensService,
    private jwtAdapter: JwtAdapter,
  ) {}

  async execute({
    payload,
  }: RefreshTokensCommand): Promise<AccessAndRefreshTokensDto> {
    const refreshTokenPayload = this.jwtAdapter.verifyRefreshToken(
      payload.refreshToken,
    );

    if (!refreshTokenPayload) {
      this.logger.debug('Refresh token is not valid');
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    const tokens: GenerateTokensResult = this.tokensService.generateTokens({
      userId: refreshTokenPayload.userId,
      deviceId: refreshTokenPayload.deviceId,
    });

    const oldIssuedAtUnixTimestamp = refreshTokenPayload.iat;

    const oldIssuedAt = new Date(oldIssuedAtUnixTimestamp * 1000);

    await this.commandBus.execute(
      new UpdateSessionCommand({
        userId: refreshTokenPayload.userId,
        deviceId: refreshTokenPayload.deviceId,
        ip: payload.ip,
        oldIssuedAt: oldIssuedAt,
        newIssuedAt: tokens.refreshTokenIssuedAt,
        expiresAt: tokens.refreshTokenExpiresAt,
      }),
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
