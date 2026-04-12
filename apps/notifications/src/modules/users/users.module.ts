import { Module } from '@nestjs/common';
import { UserRegisteredHandler } from './application/user-registered.handler';
import { PasswordResetRequestedHandler } from './application/password-reset-requested.handler';
import { PasswordChangedHandler } from './application/password-changed.handler';

@Module({
  providers: [
    UserRegisteredHandler,
    PasswordResetRequestedHandler,
    PasswordChangedHandler,
  ],
})
export class UsersModule {}
