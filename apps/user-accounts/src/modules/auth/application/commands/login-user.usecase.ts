import {
  Command,
  CommandBus,
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AccessAndRefreshTokensDto } from '@snaptix/contracts/tokens';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CryptoService } from '../services/crypto.service';
import { UserContextDto } from '../../../../../../gateway/src/core/dto/user-context.dto';
import { DomainException } from '@snaptix/common';
import { COMMON_ERRORS, USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import { JwtAdapter } from '../../infrastructure/jwt.adapter';
import { CreateSessionCommand } from '../../../sessions/application/commands/create-session.usecase';

class LoginUserCommandRequest {
  email: string;
  password: string;
  ip: string;
  deviceName: string;
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
    private jwtAdapter: JwtAdapter,
    private commandBus: CommandBus,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<AccessAndRefreshTokensDto> {
    const result = await this.validateUserOrThrow(dto.email, dto.password);
    const { userId } = result;

    const accessToken = this.jwtAdapter.createAccessToken(userId);
    const deviceId: string = crypto.randomUUID();
    const refreshToken = this.jwtAdapter.createRefreshToken(userId, deviceId);
    const payload = this.jwtAdapter.decodeRefreshToken(refreshToken);

    await this.commandBus.execute(
      new CreateSessionCommand({
        userId,
        deviceId,
        deviceName: dto.deviceName,
        ip: dto.ip,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
      }),
    );

    return { accessToken, refreshToken };
  }

  // TODO: Переместить UserContextDto в libs
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
