import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { CryptoService } from './application/crypto.service';
import { RegisterUserUseCase } from './application/commands/register-user.usecase';
import { UsersModule } from '../users/users.module';
import { ConfirmRegistrationUseCase } from './application/commands/confirm-registration.usecase';
import { AuthConfig } from './auth.config';
import { GetMeQueryHandler } from './application/queries/get-me.usecase';
import { ForgotPasswordUseCase } from './application/commands/forgot-password.usecase';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    CryptoService,
    RegisterUserUseCase,
    ConfirmRegistrationUseCase,
    AuthConfig,
    GetMeQueryHandler,
    ForgotPasswordUseCase,
  ],
})
export class AuthModule {}
