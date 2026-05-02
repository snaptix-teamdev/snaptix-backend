import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '@snaptix/common';
import { FILES_ERRORS } from '@snaptix/contracts';
import { FileRecordsRepository } from '../../infrastructure/file-records.repository';

class RevokeFileAccessCommandRequest {
  fileId: string;
  userId: string;
}

export class RevokeFileAccessCommand extends Command<void> {
  constructor(public readonly dto: RevokeFileAccessCommandRequest) {
    super();
  }
}

@CommandHandler(RevokeFileAccessCommand)
export class RevokeFileAccessUseCase implements ICommandHandler<
  RevokeFileAccessCommand,
  void
> {
  constructor(private readonly fileRecordsRepository: FileRecordsRepository) {}

  async execute({ dto }: RevokeFileAccessCommand): Promise<void> {
    const fileRecord = await this.fileRecordsRepository.findById(dto.fileId);

    if (!fileRecord) {
      throw new DomainException(FILES_ERRORS.FILE_NOT_FOUND);
    }

    if (fileRecord.userId !== dto.userId) {
      throw new DomainException(FILES_ERRORS.FILE_ACCESS_FORBIDDEN);
    }

    fileRecord.revoke();

    await this.fileRecordsRepository.update(fileRecord);
  }
}
