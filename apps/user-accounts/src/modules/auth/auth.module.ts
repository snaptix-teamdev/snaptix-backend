import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { CryptoService } from './application/crypto.service';
import { RegisterUserUseCase } from './application/commands/register-user.usecase';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [CryptoService, RegisterUserUseCase],
})
export class AuthModule {}
