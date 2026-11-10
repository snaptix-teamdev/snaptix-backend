import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FilesRepository } from '../../infrastructure/files.repository';
import { Logger } from '@nestjs/common';
import { S3Service } from '../../../../infrastructure/s3/s3.service';
import { DomainException } from '@snaptix/common';
import { FILES_ERRORS } from '@snaptix/contracts';

class DeleteAvatarCommandPayload {
  profileId: string;
}

export class DeleteAvatarCommand extends Command<void> {
  constructor(public payload: DeleteAvatarCommandPayload) {
    super();
  }
}

@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCase implements ICommandHandler<
  DeleteAvatarCommand,
  void
> {
  private readonly logger = new Logger(DeleteAvatarUseCase.name);

  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute({ payload }: DeleteAvatarCommand): Promise<void> {
    const file = await this.filesRepository.findByEntityId(payload.profileId);

    if (!file) {
      throw new DomainException(FILES_ERRORS.FILE_NOT_FOUND);
    }

    try {
      await this.s3Service.tagObjectForDeletion(file.storageKey);
    } catch (e) {
      this.logger.warn(
        `Failed to tag file for deletion: storageKey=${file.storageKey}`,
        e,
      );
    }

    await this.filesRepository.softDeleteById(file.id);
  }
}
