import { Module } from '@nestjs/common';
import { UserConverter } from './converter/user.converter';
import { CreateUserUseCase } from './application/create-user.usecase';
import { UserRepository } from './infrastructure/user.repository';

@Module({
  controllers: [],
  providers: [UserConverter, CreateUserUseCase, UserRepository],
})
export class UsersModule {}
