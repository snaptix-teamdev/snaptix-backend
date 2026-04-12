import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import {
  USER_ACCOUNTS_EXCHANGE,
  UserRegisteredEvent,
} from '@snaptix/contracts';
import { USER_EVENTS } from '@snaptix/contracts/constants/events';
import { EmailService } from '../../../infrastructure/email/application/email.service';

@Injectable()
export class UserRegisteredHandler {
  private readonly logger = new Logger(UserRegisteredHandler.name);

  constructor(private emailService: EmailService) {}

  @RabbitSubscribe({
    exchange: USER_ACCOUNTS_EXCHANGE,
    routingKey: USER_EVENTS.USER_REGISTERED,
    queue: 'notifications.user-accounts.queue',
  })
  async handle(event: UserRegisteredEvent): Promise<void> {
    this.logger.debug(`User registered: ${event.email} (id: ${event.userId})`);

    await this.emailService.confirmEmailRegistration({
      email: event.email,
      emailConfirmationCode: event.emailConfirmationCode,
    });
  }
}
