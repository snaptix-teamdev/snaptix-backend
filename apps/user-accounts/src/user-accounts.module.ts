import { Module } from '@nestjs/common';
import { configModule } from './core/config/config-module';
import { CoreModule } from './core/core.module';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthController } from './accounts/api/auth.controller';
import { SecurityDevicesController } from './accounts/api/security-devices.controller';
import { UserController } from './accounts/api/user.controller';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './core/constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { JwtAdapter } from './infrastructure/jwt.adapter';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { ConfirmRegistrationUseCase } from './accounts/application/commands/auth-commands/confirm-registration.usecase';
import { RegisterUserUseCase } from './accounts/application/commands/auth-commands/register-user.usecase';
import { ForgotPasswordUseCase } from './accounts/application/commands/auth-commands/forgot-password.usecase';
import { LoginUserUseCase } from './accounts/application/commands/auth-commands/login-user.usecase';
import { ResetPasswordUseCase } from './accounts/application/commands/auth-commands/reset-password.usecase';
import { RefreshTokensUseCase } from './accounts/application/commands/auth-commands/refresh-tokens.usecase';
import { ResendEmailConfirmationCodeUseCase } from './accounts/application/commands/auth-commands/resend-email-confirmation-code.usecase';
import { LogoutUserUseCase } from './accounts/application/commands/auth-commands/logout-user.usecase';
import { CreateSessionUseCase } from './accounts/application/commands/session-commands/create-session.usecase';
import { UpdateSessionUseCase } from './accounts/application/commands/session-commands/update-session.usecase';
import { DeactivateSessionsExcludingCurrentUseCase } from './accounts/application/commands/session-commands/deactivate-sessions-excluding-current.usecase';
import { AuthConfig } from './accounts/config/auth.config';
import { CryptoService } from './accounts/application/services/crypto.service';
import { GetMeQueryHandler } from './accounts/application/queries/get-me.query';
import { TokensService } from './accounts/application/services/tokens.service';
import { SessionConverter } from './accounts/converters/session.converter';
import { SessionsRepository } from './infrastructure/sessions.repository';
import { UserConverter } from './accounts/converters/user.converter';
import { GetActiveDevicesQueryHandler } from './accounts/application/queries/get-active-devices.query';
import { GetRegisteredUsersCountQueryHandler } from './accounts/application/queries/get-registered-users-count.query';
import { SessionsQueryRepository } from './infrastructure/query/sessions.query-repository';
import { AuthenticateWithGoogleUseCase } from './accounts/application/commands/auth-commands/authenticate-with-google.usecase';
import { UserProvidersRepository } from './infrastructure/user-providers.repository';
import { UserProviderConverter } from './accounts/converters/user-provider.converter';
import { ProfileSettingsController } from './accounts/api/profile-settings.controller';
import { CompleteProfileUseCase } from './accounts/application/commands/profile-commands/complete-profile.usecase';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAME } from '@snaptix/contracts';
import { CoreConfig } from './core/config/core.config';

const authUseCases = [
  RegisterUserUseCase,
  ConfirmRegistrationUseCase,
  ForgotPasswordUseCase,
  LoginUserUseCase,
  ResetPasswordUseCase,
  RefreshTokensUseCase,
  ResendEmailConfirmationCodeUseCase,
  LogoutUserUseCase,
  AuthenticateWithGoogleUseCase,
];
const sessionUseCases = [
  CreateSessionUseCase,
  UpdateSessionUseCase,
  DeactivateSessionsExcludingCurrentUseCase,
];
const profileUseCases = [CompleteProfileUseCase];

@Module({
  imports: [
    configModule,
    CoreModule,
    InfrastructureModule,
    CqrsModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_NAME.GEO,
        inject: [CoreConfig],
        useFactory: (coreConfig: CoreConfig) => ({
          transport: Transport.TCP,
          options: {
            host: coreConfig.microserviceGeoHost,
            port: coreConfig.microserviceGeoPort,
          },
        }),
      },
    ]),
  ],
  controllers: [
    AuthController,
    SecurityDevicesController,
    UserController,
    ProfileSettingsController,
  ],
  providers: [
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (authConfig: AuthConfig): JwtService => {
        return new JwtService({
          secret: authConfig.ACCESS_TOKEN_SECRET,
          signOptions: {
            // TODO: реализовать поддержку формата '1d', '1m', '60s'
            expiresIn: authConfig.ACCESS_TOKEN_EXPIRE_IN,
          },
        });
      },
      inject: [AuthConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (authConfig: AuthConfig): JwtService => {
        return new JwtService({
          secret: authConfig.REFRESH_TOKEN_SECRET,
          signOptions: {
            expiresIn: authConfig.REFRESH_TOKEN_EXPIRE_IN,
          },
        });
      },
      inject: [AuthConfig],
    },
    ...authUseCases,
    ...sessionUseCases,
    ...profileUseCases,
    CryptoService,
    AuthConfig,
    GetMeQueryHandler,
    JwtAdapter,
    TokensService,
    SessionConverter,
    SessionsRepository,
    UserConverter,
    UsersRepository,
    UsersQueryRepository,
    GetActiveDevicesQueryHandler,
    GetRegisteredUsersCountQueryHandler,
    SessionsQueryRepository,
    UserProvidersRepository,
    UserProviderConverter,
  ],
})
export class UserAccountsModule {}
