import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import {
  USER_ACCOUNTS_EXCHANGE,
  PasswordResetRequestedEvent,
} from '@snaptix/contracts';
import { USER_EVENTS } from '@snaptix/contracts/constants/events';
import { EmailService } from '../../../infrastructure/email/application/email.service';

@Injectable()
export class PasswordResetRequestedHandler {
  private readonly logger = new Logger(PasswordResetRequestedHandler.name);

  constructor(private emailService: EmailService) {}

  @RabbitSubscribe({
    exchange: USER_ACCOUNTS_EXCHANGE,
    routingKey: USER_EVENTS.USER_PASSWORD_RESET_REQUESTED,
    queue: 'notifications.user-accounts.password-reset-requested.queue',
  })
  async handle(event: PasswordResetRequestedEvent): Promise<void> {
    this.logger.debug(
      `Password reset requested: ${event.email} (id: ${event.userId})`,
    );

    await this.emailService.resetPasswordRequested({
      email: event.email,
      username: event.username,
      passwordResetCode: event.passwordResetCode,
      passwordResetCodeTtlHours: event.passwordResetCodeTtlHours,
    });
  }
}
