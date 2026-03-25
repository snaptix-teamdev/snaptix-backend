import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../infrastructure/user.repository';
import { UserEntity } from '../domain/user.entity';

class UserCreateDTO {
  email: string;
  username: string;
  password: string;
}

//type CommandResponse = Pick<IUser, 'id'>;

export class CreateUserCommand extends Command<UserEntity> {
  constructor(public readonly payload: UserCreateDTO) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<UserEntity> {
    // const hashPassword = await this.bcryptService.hashPassword(
    //   command.payload.password,
    // );

    // const user: UserEntity = UserEntity.create(
    //   command.payload,
    //   this.userAccountsConfig.confirmationCodeExpiration,
    // );
    //
    // user.installPassword(hashPassword);
    //
    // const createUser: UserEntity = await this.userRepository.createUser(user);

    const user = UserEntity.create({
      email: command.payload.email,
      username: command.payload.username,
      passwordHash: command.payload.password,
    });

    const createdUser = await this.userRepository.create(user);

    return createdUser;
  }
}
