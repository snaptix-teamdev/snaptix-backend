import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdapter } from '../../infrastructure/jwt.adapter';
import { RefreshTokenPayloadDto } from '@snaptix/contracts/tokens';

class GenerateTokensCommandRequest {
  userId: string;
  deviceId: string;
}

export interface GenerateTokensResult {
  accessToken: string;
  refreshToken: string;
  refreshTokenIssuedAt: Date;
  refreshTokenExpiresAt: Date;
}

export class GenerateTokensCommand extends Command<GenerateTokensResult> {
  constructor(public dto: GenerateTokensCommandRequest) {
    super();
  }
}

@CommandHandler(GenerateTokensCommand)
export class GenerateTokensUseCase implements ICommandHandler<
  GenerateTokensCommand,
  GenerateTokensResult
> {
  constructor(private jwtAdapter: JwtAdapter) {}

  async execute({ dto }: GenerateTokensCommand): Promise<GenerateTokensResult> {
    const accessToken = this.jwtAdapter.createAccessToken(dto.userId);
    const refreshToken = this.jwtAdapter.createRefreshToken(
      dto.userId,
      dto.deviceId,
    );
    const refreshTokenPayload: RefreshTokenPayloadDto =
      this.jwtAdapter.decodeRefreshToken(refreshToken);

    return Promise.resolve({
      accessToken,
      refreshToken,
      refreshTokenIssuedAt: new Date(refreshTokenPayload.iat * 1000),
      refreshTokenExpiresAt: new Date(refreshTokenPayload.exp * 1000),
    });
  }
}
