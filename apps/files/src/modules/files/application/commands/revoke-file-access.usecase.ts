import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '@snaptix/common';
import { FILES_ERRORS, RevokeFileAccessResponseDto } from '@snaptix/contracts';
import { FileRecordsRepository } from '../../infrastructure/file-records.repository';

class RevokeFileAccessCommandRequest {
  fileId: string;
  userId: string;
}

export class RevokeFileAccessCommand extends Command<RevokeFileAccessResponseDto> {
  constructor(public readonly dto: RevokeFileAccessCommandRequest) {
    super();
  }
}

@CommandHandler(RevokeFileAccessCommand)
export class RevokeFileAccessUseCase implements ICommandHandler<
  RevokeFileAccessCommand,
  RevokeFileAccessResponseDto
> {
  constructor(private readonly fileRecordsRepository: FileRecordsRepository) {}

  async execute({
    dto,
  }: RevokeFileAccessCommand): Promise<RevokeFileAccessResponseDto> {
    const fileRecord = await this.fileRecordsRepository.findById(dto.fileId);

    if (!fileRecord) {
      throw new DomainException(FILES_ERRORS.FILE_NOT_FOUND);
    }

    if (fileRecord.userId !== dto.userId) {
      throw new DomainException(FILES_ERRORS.FILE_ACCESS_FORBIDDEN);
    }

    fileRecord.revoke();

    await this.fileRecordsRepository.update(fileRecord);

    return {};
  }
}
