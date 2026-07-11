import {
  Command,
  CommandBus,
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AccessAndRefreshTokensDto } from '@snaptix/contracts/tokens';
import { UserProvidersRepository } from '../../../../infrastructure/user-providers.repository';
import { DomainException, OAuthProviderType } from '@snaptix/common';
import { UserProviderEntity } from '../../../domain/user-provider/user-provider.entity';
import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import {
  GenerateTokensResult,
  TokensService,
} from '../../services/tokens.service';
import { buildDeviceInfo } from '../../helpers/build-device-info.helper';
import { CreateSessionCommand } from '../session-commands/create-session.usecase';
import { UsersRepository } from '../../../../infrastructure/users.repository';

class AuthenticateWithGoogleCommandRequest {
  email: string;
  externalProviderId: string;
  provider: OAuthProviderType;
  ip: string | null;
  userAgent: string;
}

export class AuthenticateWithGoogleCommand extends Command<AccessAndRefreshTokensDto> {
  constructor(public dto: AuthenticateWithGoogleCommandRequest) {
    super();
  }
}

@CommandHandler(AuthenticateWithGoogleCommand)
export class AuthenticateWithGoogleUseCase implements ICommandHandler<
  AuthenticateWithGoogleCommand,
  AccessAndRefreshTokensDto
> {
  constructor(
    private userProvidersRepository: UserProvidersRepository,
    private tokensService: TokensService,
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    dto,
  }: AuthenticateWithGoogleCommand): Promise<AccessAndRefreshTokensDto> {
    const { email, externalProviderId, provider, ip, userAgent } = dto;

    const userProvider: UserProviderEntity | null =
      await this.userProvidersRepository.findByProviderAndProviderId(
        externalProviderId,
        provider,
      );

    if (!userProvider) {
      // const user: UserEntity | null =
      //   await this.usersRepository.findByEmail(email);
      //
      // if (!user) {
      //   return;
      // }
      //
      // if (user.isDeleted()) {
      //   throw new DomainException(USER_ACCOUNTS_ERRORS.USER_IS_DELETED);
      // }
      //
      // const isCompareEmail = user.email === email;
      //
      // if (!isCompareEmail) {
      // }

      return {
        accessToken: '',
        refreshToken: '',
      };
    }

    if (userProvider.user.isDeleted()) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.USER_IS_DELETED);
    }

    const isCompareEmail = userProvider.email === email;

    if (!isCompareEmail) {
      userProvider.changeEmail(email);
      await this.userProvidersRepository.updateEmail(userProvider);
    }

    const deviceId: string = crypto.randomUUID();
    const userId = userProvider.user.id;
    const tokens: GenerateTokensResult = this.tokensService.generateTokens({
      userId,
      deviceId,
    });
    const deviceName = buildDeviceInfo(userAgent);

    await this.commandBus.execute(
      new CreateSessionCommand({
        userId,
        deviceId,
        deviceName,
        ip,
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
