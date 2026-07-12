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
import { UserEntity } from '../../../domain/user/user.entity';

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

  private async createSessionWithTokens(
    userId: string,
    userAgent: string,
    ip: string | null,
  ): Promise<AccessAndRefreshTokensDto> {
    const deviceId: string = crypto.randomUUID();
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
      const user: UserEntity | null =
        await this.usersRepository.findByEmail(email);

      if (!user) {
        const userProvider: UserProviderEntity | null =
          await this.userProvidersRepository.findByEmail(email);

        if (!userProvider) {
          return {
            accessToken: '',
            refreshToken: '',
          };
        }

        // const user: UserEntity | null = await this.usersRepository.findById(
        //   userProvider.user.id,
        // );

        return {
          accessToken: '',
          refreshToken: '',
        };
      }

      if (user.isDeleted()) {
        throw new DomainException(USER_ACCOUNTS_ERRORS.USER_IS_DELETED);
      }

      if (!user.isEmailVerified()) {
        user.confirmEmailByOAuthProvider();

        await this.usersRepository.update(user);
      }

      const userProvider: UserProviderEntity = UserProviderEntity.create({
        provider,
        externalProviderId,
        email,
        user,
      });

      await this.userProvidersRepository.create(userProvider);

      return this.createSessionWithTokens(user.id, userAgent, ip);
    }

    if (userProvider.user.isDeleted()) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.USER_IS_DELETED);
    }

    const isCompareEmail = userProvider.email === email;

    if (!isCompareEmail) {
      userProvider.changeEmail(email);
      await this.userProvidersRepository.updateEmail(userProvider);
    }

    return this.createSessionWithTokens(userProvider.user.id, userAgent, ip);
  }
}
