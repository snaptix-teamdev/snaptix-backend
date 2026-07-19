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
import { randomInt } from 'crypto';
import { AuthConfig } from '../../../config/auth.config';
import { Logger } from '@nestjs/common';
import { TransactionManager } from '../../../../infrastructure/prisma/transaction.manager';

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
  private logger = new Logger(AuthenticateWithGoogleUseCase.name);

  constructor(
    private userProvidersRepository: UserProvidersRepository,
    private tokensService: TokensService,
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
    private authConfig: AuthConfig,
    private transactionManager: TransactionManager,
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

  private async createUserWithProvider(
    email: string,
    provider: OAuthProviderType,
    externalProviderId: string,
  ): Promise<UserEntity> {
    return this.transactionManager.run(async (tx) => {
      const username = `client${randomInt(100_000, 999_999)}`;

      const user: UserEntity = UserEntity.create(
        {
          username,
          email,
          passwordHash: null,
        },
        this.authConfig.EMAIL_CONFIRMATION_CODE_TTL_HOURS,
      );

      user.confirmEmailByOAuthProvider();

      const createdUser: UserEntity = await this.usersRepository.create(
        user,
        tx,
      );

      const userProvider: UserProviderEntity = UserProviderEntity.create({
        provider,
        externalProviderId,
        email,
        user: createdUser,
      });

      await this.userProvidersRepository.create(userProvider, tx);

      return createdUser;
    });
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
          const createdUser = await this.createUserWithProvider(
            email,
            provider,
            externalProviderId,
          );

          return this.createSessionWithTokens(createdUser.id, userAgent, ip);
        }

        this.logger.warn(
          `UserProvider found by email but not by providerId. ` +
            `provider=${provider}, oldProviderId=${userProvider.externalProviderId}, newProviderId=${externalProviderId}`,
        );

        if (userProvider.user.isDeleted()) {
          throw new DomainException(USER_ACCOUNTS_ERRORS.USER_IS_DELETED);
        }

        userProvider.update(externalProviderId, email);

        await this.userProvidersRepository.updateProviderIdAndEmail(
          userProvider,
        );

        return this.createSessionWithTokens(
          userProvider.user.id,
          userAgent,
          ip,
        );
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
