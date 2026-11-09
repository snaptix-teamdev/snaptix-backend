import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/users.repository';
import { Inject } from '@nestjs/common';
import {
  DeleteAvatarMsResponseDto,
  DeleteAvatarPayload,
  FILES_MICROSERVICE_PATTERNS,
  LinkFileToEntityMsResponseDto,
  LinkFileToEntityPayload,
  MICROSERVICE_NAME,
  USER_ACCOUNTS_ERRORS,
} from '@snaptix/contracts';
import { ClientProxy } from '@nestjs/microservices';
import { DomainException, FileEntityType } from '@snaptix/common';
import { firstValueFrom } from 'rxjs';

class AddAvatarCommandRequest {
  userId: string;
  fileId: string;
}

type AddAvatarCommandResult = { storageKey: string };

export class AddAvatarCommand extends Command<AddAvatarCommandResult> {
  constructor(public dto: AddAvatarCommandRequest) {
    super();
  }
}

@CommandHandler(AddAvatarCommand)
export class AddAvatarUseCase implements ICommandHandler<
  AddAvatarCommand,
  AddAvatarCommandResult
> {
  constructor(
    @Inject(MICROSERVICE_NAME.FILES) private files: ClientProxy,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: AddAvatarCommand): Promise<AddAvatarCommandResult> {
    const { userId, fileId } = dto;
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND);
    }

    if (user.profile.storageKey) {
      await firstValueFrom(
        this.files.send<DeleteAvatarMsResponseDto, DeleteAvatarPayload>(
          FILES_MICROSERVICE_PATTERNS.FILES.DELETE_USER_AVATAR,
          { profileId: user.profile.id },
        ),
      );
    }

    const { storageKey } = await firstValueFrom(
      this.files.send<LinkFileToEntityMsResponseDto, LinkFileToEntityPayload>(
        FILES_MICROSERVICE_PATTERNS.FILES.LINK_FILE_TO_ENTITY,
        {
          userId,
          fileId,
          entityId: user.profile.id,
          entityType: FileEntityType.USER_AVATAR,
        },
      ),
    );

    user.setAvatar(storageKey);
    await this.usersRepository.update(user);

    return { storageKey };
  }
}
