import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import {
  USER_ACCOUNTS_EXCHANGE,
  PasswordChangedEvent,
} from '@snaptix/contracts';
import { USER_EVENTS } from '@snaptix/contracts/constants/events';
import { EmailService } from '../../../infrastructure/email/application/email.service';

@Injectable()
export class PasswordChangedHandler {
  private readonly logger = new Logger(PasswordChangedHandler.name);

  constructor(private emailService: EmailService) {}

  @RabbitSubscribe({
    exchange: USER_ACCOUNTS_EXCHANGE,
    routingKey: USER_EVENTS.USER_PASSWORD_CHANGED,
    queue: 'notifications.user-accounts.password-changed.queue',
  })
  async handle(event: PasswordChangedEvent): Promise<void> {
    this.logger.debug(`Password changed: ${event.email} (id: ${event.userId})`);

    await this.emailService.passwordChanged({
      email: event.email,
      username: event.username,
    });
  }
}
