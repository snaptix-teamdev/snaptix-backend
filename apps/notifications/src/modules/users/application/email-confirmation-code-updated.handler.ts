import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import {
  USER_ACCOUNTS_EXCHANGE,
  EmailConfirmationCodeUpdatedEvent,
} from '@snaptix/contracts';
import { USER_EVENTS } from '@snaptix/contracts/constants/events';
import { EmailService } from '../../../infrastructure/email/application/email.service';

@Injectable()
export class EmailConfirmationCodeUpdatedHandler {
  private readonly logger = new Logger(
    EmailConfirmationCodeUpdatedHandler.name,
  );

  constructor(private emailService: EmailService) {}

  @RabbitSubscribe({
    exchange: USER_ACCOUNTS_EXCHANGE,
    routingKey: USER_EVENTS.USER_EMAIL_CONFIRMATION_CODE_UPDATED,
    queue: 'notifications.user-accounts.email-confirmation-code-updated.queue',
  })
  async handle(event: EmailConfirmationCodeUpdatedEvent): Promise<void> {
    this.logger.debug(
      `Email confirmation code updated: ${event.email} (id: ${event.userId})`,
    );

    await this.emailService.resendEmailConfirmation({
      email: event.email,
      username: event.username,
      emailConfirmationCode: event.emailConfirmationCode,
      emailConfirmationCodeTtlHours: event.emailConfirmationCodeTtlHours,
    });
  }
}
