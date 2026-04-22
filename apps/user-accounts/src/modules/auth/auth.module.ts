import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { CryptoService } from './application/services/crypto.service';
import { RegisterUserUseCase } from './application/commands/register-user.usecase';
import { UsersModule } from '../users/users.module';
import { ConfirmRegistrationUseCase } from './application/commands/confirm-registration.usecase';
import { AuthConfig } from './auth.config';
import { GetMeQueryHandler } from './application/queries/get-me.usecase';
import { ForgotPasswordUseCase } from './application/commands/forgot-password.usecase';
import { LoginUserUseCase } from './application/commands/login-user.usecase';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../core/constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { JwtAdapter } from './infrastructure/jwt.adapter';
import { ResetPasswordUseCase } from './application/commands/reset-password.usecase';
import { RefreshTokensUseCase } from './application/commands/refresh-tokens.usecase';
import { SessionsModule } from '../sessions/sessions.module';
import { ResendEmailConfirmationCodeUseCase } from './application/commands/resend-email-confirmation-code.usecase';
import { TokensService } from './application/services/tokens.service';
import { LogoutUserUseCase } from './application/commands/logout-user.usecase';

const useCases = [
  RegisterUserUseCase,
  ConfirmRegistrationUseCase,
  ForgotPasswordUseCase,
  LoginUserUseCase,
  ResetPasswordUseCase,
  RefreshTokensUseCase,
  ResendEmailConfirmationCodeUseCase,
  LogoutUserUseCase,
];

@Module({
  imports: [UsersModule, SessionsModule],
  controllers: [AuthController],
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
    ...useCases,
    CryptoService,
    AuthConfig,
    GetMeQueryHandler,
    JwtAdapter,
    TokensService,
  ],
})
export class AuthModule {}
