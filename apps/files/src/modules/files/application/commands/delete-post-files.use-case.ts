import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FilesRepository } from '../../infrastructure/files.repository';
import { S3Service } from '../../../../infrastructure/s3/s3.service';

class DeletePostFilesCommandPayload {
  postId: string;
  userId: string;
}

type DeletePostFilesCommandResult = void;

export class DeletePostFilesCommand extends Command<DeletePostFilesCommandResult> {
  constructor(public payload: DeletePostFilesCommandPayload) {
    super();
  }
}

@CommandHandler(DeletePostFilesCommand)
export class DeletePostFilesUseCase implements ICommandHandler<
  DeletePostFilesCommand,
  DeletePostFilesCommandResult
> {
  private readonly logger = new Logger(DeletePostFilesUseCase.name);

  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute({ payload }: DeletePostFilesCommand): Promise<void> {
    const files = await this.filesRepository.findManyByEntityId(payload.postId);

    if (files.length === 0) {
      return;
    }

    const taggingResults = await Promise.allSettled(
      files.map((file) => this.s3Service.tagObjectForDeletion(file.storageKey)),
    );

    taggingResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.warn(
          `Failed to tag file for deletion: storageKey=${files[index].storageKey}`,
          result.reason,
        );
      }
    });

    await this.filesRepository.softDeleteManyByEntityId(payload.postId);

    this.logger.debug(
      `Soft-deleted ${files.length} files for post: ${payload.postId}`,
    );
  }
}
