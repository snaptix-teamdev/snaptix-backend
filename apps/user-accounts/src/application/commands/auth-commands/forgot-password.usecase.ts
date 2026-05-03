import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { IUser } from '@snaptix/common';
import { USER_ACCOUNTS_EXCHANGE, USER_EVENTS } from '@snaptix/contracts';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { AuthConfig } from '../../../config/auth.config';
import { Logger } from '@nestjs/common';

export class ForgotPasswordCommand extends Command<void> {
  constructor(public readonly payload: { email: string }) {
    super();
  }
}

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordUseCase implements ICommandHandler<
  ForgotPasswordCommand,
  void
> {
  private logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    private usersRepository: UsersRepository,
    private authConfig: AuthConfig,
    private amqpConnection: AmqpConnection,
  ) {}

  async execute({ payload }: ForgotPasswordCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(payload.email);

    if (!user) {
      this.logger.debug('User with email not found');
      return;
    }

    user.createPasswordRecoveryCode(
      this.authConfig.PASSWORD_RESET_CODE_TTL_HOURS,
    );

    await this.usersRepository.update(user);

    await this.emitPasswordResetRequested({
      user,
      passwordResetCodeTtlHours: this.authConfig.PASSWORD_RESET_CODE_TTL_HOURS,
    });
  }

  private async emitPasswordResetRequested(payload: {
    user: IUser;
    passwordResetCodeTtlHours: number;
  }): Promise<void> {
    if (!payload.user.recoveryPassword) {
      throw new Error('User does not have recovery password');
    }

    await this.amqpConnection.publish(
      USER_ACCOUNTS_EXCHANGE,
      USER_EVENTS.USER_PASSWORD_RESET_REQUESTED,
      {
        userId: payload.user.id,
        username: payload.user.username,
        email: payload.user.email,
        passwordResetCode: payload.user.recoveryPassword.code,
        passwordResetCodeTtlHours: payload.passwordResetCodeTtlHours,
      },
    );
  }
}
