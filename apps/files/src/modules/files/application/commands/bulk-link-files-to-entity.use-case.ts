import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FilesRepository } from '../../infrastructure/files.repository';
import {
  DomainException,
  FileEntityType,
  IBulkDomainError,
} from '@snaptix/common';
import { FILES_ERRORS } from '@snaptix/contracts';
import { FileEntity } from '../../domain/file.entity';
import { Logger } from '@nestjs/common';

class BulkLinkFilesToEntityCommandPayload {
  userId: string;
  fileIds: string[];
  entityId: string;
  entityType: FileEntityType;
}

type BulkLinkFilesToEntityCommandResult = {
  succeeded: { storageKey: string; fileId: string }[];
  failed: IBulkDomainError[];
};

export class BulkLinkFilesToEntityCommand extends Command<BulkLinkFilesToEntityCommandResult> {
  constructor(public readonly payload: BulkLinkFilesToEntityCommandPayload) {
    super();
  }
}

@CommandHandler(BulkLinkFilesToEntityCommand)
export class BulkLinkFilesToEntityUseCase implements ICommandHandler<
  BulkLinkFilesToEntityCommand,
  BulkLinkFilesToEntityCommandResult
> {
  private logger = new Logger(BulkLinkFilesToEntityUseCase.name);

  constructor(private readonly filesRepository: FilesRepository) {}

  async execute({
    payload,
  }: BulkLinkFilesToEntityCommand): Promise<BulkLinkFilesToEntityCommandResult> {
    const files = await this.filesRepository.findManyByIds(payload.fileIds);
    const fileMap = new Map(files.map((f) => [f.id, f]));

    const succeeded: FileEntity[] = [];
    const failed: IBulkDomainError[] = [];

    for (const fileId of payload.fileIds) {
      const file = fileMap.get(fileId);

      if (!file) {
        this.logger.debug(`File not found: ${fileId}`);
        failed.push({ itemId: fileId, error: FILES_ERRORS.FILE_NOT_FOUND });
        continue;
      }

      try {
        file.linkEntity({
          entityId: payload.entityId,
          entityType: payload.entityType,
          userId: payload.userId,
        });
        file.markAsReady();
        succeeded.push(file);
      } catch (e) {
        if (e instanceof DomainException) {
          this.logger.debug(e);
          failed.push({ itemId: fileId, error: e.getError() });
        } else {
          throw e;
        }
      }
    }

    if (failed.length > 0) {
      return { succeeded: [], failed };
    }

    await this.filesRepository.updateMany(succeeded);

    return {
      succeeded: succeeded.map((f) => ({
        fileId: f.id,
        storageKey: f.storageKey,
      })),
      failed: [],
    };
  }
}
