import { Module } from '@nestjs/common';
import { UserRegisteredHandler } from './application/user-registered.handler';

@Module({
  providers: [UserRegisteredHandler],
})
export class UsersModule {}
