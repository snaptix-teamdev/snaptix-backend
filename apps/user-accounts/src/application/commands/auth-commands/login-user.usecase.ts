import {
  Command,
  CommandBus,
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AccessAndRefreshTokensDto } from '@snaptix/contracts/tokens';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { CryptoService } from '../../services/crypto.service';
import { UserContextDto } from '@snaptix/common/dto/user-context.dto';
import { DomainException } from '@snaptix/common';
import { COMMON_ERRORS, USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import { CreateSessionCommand } from '../session-commands/create-session.usecase';
import {
  TokensService,
  GenerateTokensResult,
} from '../../services/tokens.service';
import { buildDeviceInfo } from '../../helpers/build-device-info.helper';

class LoginUserCommandRequest {
  email: string;
  password: string;
  ip: string | null;
  userAgent: string;
}

export class LoginUserCommand extends Command<AccessAndRefreshTokensDto> {
  constructor(public dto: LoginUserCommandRequest) {
    super();
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<
  LoginUserCommand,
  AccessAndRefreshTokensDto
> {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private tokensService: TokensService,
    private commandBus: CommandBus,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<AccessAndRefreshTokensDto> {
    const { userId } = await this.validateUserOrThrow(dto.email, dto.password);

    const deviceId: string = crypto.randomUUID();

    const tokens: GenerateTokensResult = this.tokensService.generateTokens({
      userId,
      deviceId,
    });

    const deviceName = buildDeviceInfo(dto.userAgent);

    await this.commandBus.execute(
      new CreateSessionCommand({
        userId,
        deviceId,
        deviceName,
        ip: dto.ip,
        issuedAt: tokens.refreshTokenIssuedAt,
        expiresAt: tokens.refreshTokenExpiresAt,
      }),
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async validateUserOrThrow(
    email: string,
    password: string,
  ): Promise<UserContextDto> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    const isPasswordValid = await this.cryptoService.compareHash(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }

    if (!user.isEmailVerified()) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.USER_EMAIL_NOT_CONFIRMED);
    }

    return { userId: user.id };
  }
}
