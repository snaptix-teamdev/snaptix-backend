import {
  Command,
  CommandBus,
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AccessAndRefreshTokensDto } from '@snaptix/contracts/tokens';
import { UAParser } from 'ua-parser-js';
import {
  GenerateTokensCommand,
  GenerateTokensResult,
} from './generate-tokens.usecase';
import { UpdateSessionCommand } from '../../../sessions/application/commands/update-session.usecase';
import { JwtAdapter } from '../../infrastructure/jwt.adapter';
import { DomainException } from '@snaptix/common';
import { COMMON_ERRORS } from '@snaptix/contracts';

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

    const tokens: GenerateTokensResult = await this.commandBus.execute(
      new GenerateTokensCommand({
        userId: refreshTokenPayload.userId,
        deviceId: refreshTokenPayload.deviceId,
      }),
    );

    const deviceName = this.buildDeviceInfo(payload.userAgent);

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

  //TODO: вынести в утилиты
  private buildDeviceInfo(userAgent: string): string {
    const ua = UAParser(userAgent);

    const deviceInfo = ua.device.type
      ? `Device: ${ua.device.type} ${ua.device.vendor} ${ua.device.model};`
      : '';
    const osInfo = `OS: ${ua.os.name} ${ua.os.version};`;
    const browserInfo = `Browser: ${ua.browser.name} ${ua.browser.version}`;

    return `${deviceInfo} ${osInfo} ${browserInfo}`;
  }
}
