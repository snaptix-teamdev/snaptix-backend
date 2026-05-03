import { Module } from '@nestjs/common';
import { configModule } from './core/config/config-module';
import { CoreModule } from './core/core.module';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthController } from './api/auth.controller';
import { SecurityDevicesController } from './api/security-devices.controller';
import { UserController } from './api/user.controller';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './core/constants/auth-tokens.inject-constants';
import { AuthConfig } from './config/auth.config';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserUseCase } from './application/commands/auth-commands/register-user.usecase';
import { ConfirmRegistrationUseCase } from './application/commands/auth-commands/confirm-registration.usecase';
import { ForgotPasswordUseCase } from './application/commands/auth-commands/forgot-password.usecase';
import { LoginUserUseCase } from './application/commands/auth-commands/login-user.usecase';
import { ResetPasswordUseCase } from './application/commands/auth-commands/reset-password.usecase';
import { RefreshTokensUseCase } from './application/commands/auth-commands/refresh-tokens.usecase';
import { ResendEmailConfirmationCodeUseCase } from './application/commands/auth-commands/resend-email-confirmation-code.usecase';
import { LogoutUserUseCase } from './application/commands/auth-commands/logout-user.usecase';
import { CryptoService } from './application/services/crypto.service';
import { GetMeQueryHandler } from './application/queries/get-me.usecase';
import { JwtAdapter } from './infrastructure/jwt.adapter';
import { TokensService } from './application/services/tokens.service';
import { SessionConverter } from './converters/session.converter';
import { SessionsRepository } from './infrastructure/sessions.repository';
import { CreateSessionUseCase } from './application/commands/session-commands/create-session.usecase';
import { UpdateSessionUseCase } from './application/commands/session-commands/update-session.usecase';
import { DeactivateSessionsExcludingCurrentUseCase } from './application/commands/session-commands/deactivate-sessions-excluding-current.usecase';
import { UserConverter } from './converters/user.converter';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';

const authUseCases = [
  RegisterUserUseCase,
  ConfirmRegistrationUseCase,
  ForgotPasswordUseCase,
  LoginUserUseCase,
  ResetPasswordUseCase,
  RefreshTokensUseCase,
  ResendEmailConfirmationCodeUseCase,
  LogoutUserUseCase,
];
const sessionUseCases = [
  CreateSessionUseCase,
  UpdateSessionUseCase,
  DeactivateSessionsExcludingCurrentUseCase,
];

@Module({
  imports: [
    configModule,
    CoreModule,
    InfrastructureModule,
    CqrsModule.forRoot(),
  ],
  controllers: [AuthController, SecurityDevicesController, UserController],
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
  ],
})
export class UserAccountsModule {}
