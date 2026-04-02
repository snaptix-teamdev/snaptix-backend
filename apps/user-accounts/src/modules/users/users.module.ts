import { Module } from '@nestjs/common';
import { UserConverter } from './converter/user.converter';
import { UsersRepository } from './infrastructure/users.repository';
import { UserController } from './api/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserConverter, UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
