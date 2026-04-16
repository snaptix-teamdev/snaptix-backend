import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUser } from '@snaptix/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  EmailConfirmationCodeUpdatedEvent,
  USER_ACCOUNTS_EXCHANGE,
} from '@snaptix/contracts';
import { AuthConfig } from '../../auth.config';
import { USER_EVENTS } from '@snaptix/contracts/constants/events';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UserEntity } from '../../../users/domain/user.entity';

class ResendEmailConfirmationCodeCommandRequest {
  email: string;
}

export class ResendEmailConfirmationCodeCommand extends Command<void> {
  constructor(public dto: ResendEmailConfirmationCodeCommandRequest) {
    super();
  }
}

@CommandHandler(ResendEmailConfirmationCodeCommand)
export class ResendEmailConfirmationCodeUseCase implements ICommandHandler<
  ResendEmailConfirmationCodeCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private authConfig: AuthConfig,
    private amqpConnection: AmqpConnection,
  ) {}

  async execute({ dto }: ResendEmailConfirmationCodeCommand): Promise<void> {
    const user: UserEntity | null = await this.usersRepository.findByEmail(
      dto.email,
    );

    if (!user) {
      return;
    }

    if (user.isEmailVerified()) {
      return;
    }

    user.generateEmailConfirmationCode(
      this.authConfig.EMAIL_CONFIRMATION_CODE_TTL_HOURS,
    );

    await this.usersRepository.update(user);

    await this.emitEmailConfirmationCodeUpdated(
      user,
      this.authConfig.EMAIL_CONFIRMATION_CODE_TTL_HOURS,
    );
  }

  private async emitEmailConfirmationCodeUpdated(
    user: IUser,
    emailConfirmationCodeTtlHours: number,
  ): Promise<void> {
    const payload: EmailConfirmationCodeUpdatedEvent = {
      userId: user.id,
      username: user.username,
      email: user.email,
      emailConfirmationCode: user.emailConfirmation.code,
      emailConfirmationCodeTtlHours,
    };

    await this.amqpConnection.publish(
      USER_ACCOUNTS_EXCHANGE,
      USER_EVENTS.USER_EMAIL_CONFIRMATION_CODE_UPDATED,
      payload,
    );
  }
}
