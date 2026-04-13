import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, IUser } from '@snaptix/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UserEntity } from '../../../users/domain/user.entity';
import {
  USER_ACCOUNTS_ERRORS,
  USER_ACCOUNTS_EXCHANGE,
  UserRegisteredEvent,
} from '@snaptix/contracts';
import { CryptoService } from '../services/crypto.service';
import { AuthConfig } from '../../auth.config';
import { USER_EVENTS } from '@snaptix/contracts/constants/events';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

class RegisterUserCommandRequest {
  email: string;
  password: string;
  username: string;
}

export class RegisterUserCommand extends Command<void> {
  constructor(public dto: RegisterUserCommandRequest) {
    super();
  }
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<
  RegisterUserCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private authConfig: AuthConfig,
    private amqpConnection: AmqpConnection,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    await this.checkExistsEmailOrUsername({
      username: dto.username,
      email: dto.email,
    });

    const passwordHash = await this.cryptoService.generateHash(dto.password);

    const user: UserEntity = UserEntity.create(
      {
        username: dto.username,
        email: dto.email,
        passwordHash,
      },
      this.authConfig.EMAIL_CONFIRMATION_CODE_TTL_HOURS,
    );

    const savedUserWithId = await this.usersRepository.create(user);

    await this.emitUserCreated(
      savedUserWithId,
      this.authConfig.EMAIL_CONFIRMATION_CODE_TTL_HOURS,
    );
  }

  private async checkExistsEmailOrUsername(payload: {
    email: string;
    username: string;
  }) {
    const existsUser = await this.usersRepository.checkUserByEmailOrUsername({
      email: payload.email,
      username: payload.username,
    });

    if (existsUser?.email === payload.email) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.USER_EMAIL_ALREADY_EXISTS);
    }

    if (existsUser?.username === payload.username) {
      throw new DomainException(
        USER_ACCOUNTS_ERRORS.USER_USERNAME_ALREADY_EXISTS,
      );
    }
  }

  private async emitUserCreated(
    createdUser: IUser,
    emailConfirmationCodeTtlHours: number,
  ): Promise<void> {
    const payload: UserRegisteredEvent = {
      userId: createdUser.id,
      username: createdUser.username,
      email: createdUser.email,
      emailConfirmationCode: createdUser.emailConfirmation.code,
      emailConfirmationCodeTtlHours,
    };

    await this.amqpConnection.publish(
      USER_ACCOUNTS_EXCHANGE,
      USER_EVENTS.USER_REGISTERED,
      payload,
    );
  }
}
