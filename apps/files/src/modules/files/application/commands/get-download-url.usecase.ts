import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '@snaptix/common';
import { FILES_ERRORS, GetDownloadUrlResponseDto } from '@snaptix/contracts';
import { FileRecordsRepository } from '../../infrastructure/file-records.repository';
import { S3Service } from '../../../../infrastructure/s3/s3.service';

class GetDownloadUrlCommandRequest {
  fileId: string;
}

export class GetDownloadUrlCommand extends Command<GetDownloadUrlResponseDto> {
  constructor(public readonly dto: GetDownloadUrlCommandRequest) {
    super();
  }
}

@CommandHandler(GetDownloadUrlCommand)
export class GetDownloadUrlUseCase implements ICommandHandler<
  GetDownloadUrlCommand,
  GetDownloadUrlResponseDto
> {
  constructor(
    private readonly fileRecordsRepository: FileRecordsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute({
    dto,
  }: GetDownloadUrlCommand): Promise<GetDownloadUrlResponseDto> {
    const fileRecord = await this.fileRecordsRepository.findById(dto.fileId);

    if (!fileRecord) {
      throw new DomainException(FILES_ERRORS.FILE_NOT_FOUND);
    }

    if (fileRecord.isRevoked) {
      throw new DomainException(FILES_ERRORS.FILE_ACCESS_REVOKED);
    }

    if (!fileRecord.isDownload) {
      throw new DomainException(FILES_ERRORS.FILE_NOT_READY);
    }

    const presignedUrl = await this.s3Service.getPresignedDownloadUrl(
      fileRecord.storageKey,
    );

    return { presignedUrl };
  }
}
