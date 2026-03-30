import { Module } from '@nestjs/common';
import { UserConverter } from './converter/user.converter';
import { UsersRepository } from './infrastructure/users.repository';
import { UserController } from './api/user.controller';
import { CryptoService } from '../auth/application/crypto.service';
import { RegisterUserUseCase } from '../auth/application/commands/register-user.usecase';

@Module({
  controllers: [UserController],
  providers: [
    UserConverter,
    RegisterUserUseCase,
    UsersRepository,
    CryptoService,
  ],
})
export class UsersModule {}
