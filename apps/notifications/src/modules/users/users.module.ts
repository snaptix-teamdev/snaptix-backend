import { Module } from '@nestjs/common';
import { UserRegisteredHandler } from './application/user-registered.handler';
import { PasswordResetRequestedHandler } from './application/password-reset-requested.handler';

@Module({
  providers: [UserRegisteredHandler, PasswordResetRequestedHandler],
})
export class UsersModule {}
