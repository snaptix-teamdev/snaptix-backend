import { Module } from '@nestjs/common';
import { UserRegisteredHandler } from './application/user-registered.handler';
import { PasswordResetRequestedHandler } from './application/password-reset-requested.handler';
import { PasswordChangedHandler } from './application/password-changed.handler';
import { EmailConfirmationCodeUpdatedHandler } from './application/email-confirmation-code-updated.handler';

@Module({
  providers: [
    UserRegisteredHandler,
    PasswordResetRequestedHandler,
    PasswordChangedHandler,
    EmailConfirmationCodeUpdatedHandler,
  ],
})
export class UsersModule {}
