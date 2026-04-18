import { Module } from '@nestjs/common';
import { UserConverter } from './converter/user.converter';
import { UsersRepository } from './infrastructure/users.repository';
import { UserController } from './api/user.controller';
import { UsersQueryRepository } from './infrastructure/users.query-repository';

@Module({
  controllers: [UserController],
  providers: [UserConverter, UsersRepository, UsersQueryRepository],
  exports: [UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
