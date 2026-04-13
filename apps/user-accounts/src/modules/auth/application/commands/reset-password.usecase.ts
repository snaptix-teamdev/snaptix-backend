import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

import { UserEntity } from '../../../users/domain/user.entity';
import { DomainException, IUser } from '@snaptix/common';
import {
  PasswordChangedEvent,
  USER_ACCOUNTS_ERRORS,
  USER_ACCOUNTS_EXCHANGE,
  USER_EVENTS,
} from '@snaptix/contracts';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { CryptoService } from '../services/crypto.service';

class ResetPasswordCommandRequest {
  password: string;
  code: string;
}

export class ResetPasswordCommand extends Command<void> {
  constructor(public payload: ResetPasswordCommandRequest) {
    super();
  }
}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordUseCase implements ICommandHandler<
  ResetPasswordCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private amqpConnection: AmqpConnection,
  ) {}

  async execute({ payload }: ResetPasswordCommand): Promise<void> {
    const user: UserEntity | null =
      await this.usersRepository.findByRecoveryPasswordCode(payload.code);

    if (!user) {
      throw new DomainException(
        USER_ACCOUNTS_ERRORS.USER_PASSWORD_RECOVERY_CODE_NOT_FOUND,
      );
    }

    if (user.isPasswordRecoveryCodeAlreadyUsed()) {
      throw new DomainException(
        USER_ACCOUNTS_ERRORS.USER_PASSWORD_RECOVERY_CODE_ALREADY_USED,
      );
    }

    if (user.isPasswordRecoveryCodeExpired()) {
      throw new DomainException(
        USER_ACCOUNTS_ERRORS.USER_PASSWORD_RECOVERY_CODE_EXPIRED,
      );
    }

    const newPasswordHash: string = await this.cryptoService.generateHash(
      payload.password,
    );

    user.resetPasswordByRecoveryCode({
      code: payload.code,
      newPasswordHash,
    });

    await this.usersRepository.update(user);

    //TODO: Сбросить все сессии

    await this.emitPasswordChanged(user);
  }

  private async emitPasswordChanged(user: IUser): Promise<void> {
    const payload: PasswordChangedEvent = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    await this.amqpConnection.publish(
      USER_ACCOUNTS_EXCHANGE,
      USER_EVENTS.USER_PASSWORD_CHANGED,
      payload,
    );
  }
}
