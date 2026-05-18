import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FilesRepository } from '../../infrastructure/files.repository';
import { DomainException, FileEntityType } from '@snaptix/common';
import { FILES_ERRORS } from '@snaptix/contracts';

class LinkFileToEntityCommandPayload {
  userId: string;
  fileId: string;
  entityId: string;
  entityType: FileEntityType;
}

type LinkFileToEntityCommandResult = { storageKey: string; fileId: string };

export class LinkFileToEntityCommand extends Command<LinkFileToEntityCommandResult> {
  constructor(public readonly payload: LinkFileToEntityCommandPayload) {
    super();
  }
}

@CommandHandler(LinkFileToEntityCommand)
export class LinkFileToEntityUseCase implements ICommandHandler<
  LinkFileToEntityCommand,
  LinkFileToEntityCommandResult
> {
  constructor(private readonly filesRepository: FilesRepository) {}

  async execute({
    payload,
  }: LinkFileToEntityCommand): Promise<LinkFileToEntityCommandResult> {
    const file = await this.filesRepository.findById(payload.fileId);

    if (!file) {
      throw new DomainException(FILES_ERRORS.FILE_NOT_FOUND);
    }

    file.linkEntity({
      entityId: payload.entityId,
      entityType: payload.entityType,
      userId: payload.userId,
    });

    file.markAsReady();

    await this.filesRepository.update(file);

    return {
      fileId: file.id,
      storageKey: file.storageKey,
    };
  }
}
