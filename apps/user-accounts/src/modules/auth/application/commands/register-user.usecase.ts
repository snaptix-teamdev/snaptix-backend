import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, IUser } from '@snaptix/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UserEntity } from '../../../users/domain/user.entity';
import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import { CryptoService } from '../crypto.service';

class RegisterUserCommandRequest {
  email: string;
  password: string;
  username: string;
}

type RegisterUserCommandResponse = Pick<IUser, 'id'>;

export class RegisterUserCommand extends Command<RegisterUserCommandResponse> {
  constructor(public dto: RegisterUserCommandRequest) {
    super();
  }
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<
  RegisterUserCommand,
  RegisterUserCommandResponse
> {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute({
    dto,
  }: RegisterUserCommand): Promise<RegisterUserCommandResponse> {
    await this.checkExistsEmailOrUsername({
      username: dto.username,
      email: dto.email,
    });

    const passwordHash = await this.cryptoService.generateHash(dto.password);

    const user: UserEntity = UserEntity.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
    });

    const savedUserWithId = await this.usersRepository.create(user);

    // await this.emitUserCreated(savedUserWithId);

    return { id: savedUserWithId.id };
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

  // private async emitUserCreated(createdUser: IUser) {
  //await sendToRabbitMQ(USER_EVENTS.USER_CREATED, {...});
  // }
}
