import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  DeleteAvatarMsResponseDto,
  DeleteAvatarPayload,
  FILES_MICROSERVICE_PATTERNS,
  MICROSERVICE_NAME,
  USER_ACCOUNTS_ERRORS,
} from '@snaptix/contracts';
import { ClientProxy } from '@nestjs/microservices';
import { UsersRepository } from '../../../../infrastructure/users.repository';
import { DomainException } from '@snaptix/common';
import { firstValueFrom } from 'rxjs';

class DeleteUserAvatarCommandRequest {
  userId: string;
}

export class DeleteUserAvatarCommand extends Command<void> {
  constructor(public dto: DeleteUserAvatarCommandRequest) {
    super();
  }
}

@CommandHandler(DeleteUserAvatarCommand)
export class DeleteUserAvatarUseCase implements ICommandHandler<
  DeleteUserAvatarCommand,
  void
> {
  constructor(
    @Inject(MICROSERVICE_NAME.FILES) private files: ClientProxy,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: DeleteUserAvatarCommand): Promise<void> {
    const user = await this.usersRepository.findById(dto.userId);

    if (!user) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND);
    }

    await firstValueFrom(
      this.files.send<DeleteAvatarMsResponseDto, DeleteAvatarPayload>(
        FILES_MICROSERVICE_PATTERNS.FILES.DELETE_USER_AVATAR,
        { profileId: user.profile.id },
      ),
    );

    user.removeAvatar();
    await this.usersRepository.update(user);
  }
}
