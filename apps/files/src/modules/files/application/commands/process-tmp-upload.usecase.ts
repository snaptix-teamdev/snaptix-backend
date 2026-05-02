import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FileRecordsRepository } from '../../infrastructure/file-records.repository';
import { S3Service } from '../../../../infrastructure/s3/s3.service';

class ProcessTmpUploadCommandRequest {
  storageKey: string;
  fileSize: number;
}

export class ProcessTmpUploadCommand extends Command<void> {
  constructor(public readonly dto: ProcessTmpUploadCommandRequest) {
    super();
  }
}

@CommandHandler(ProcessTmpUploadCommand)
export class ProcessTmpUploadUseCase implements ICommandHandler<
  ProcessTmpUploadCommand,
  void
> {
  private readonly logger = new Logger(ProcessTmpUploadUseCase.name);

  constructor(
    private readonly fileRecordsRepository: FileRecordsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute({ dto }: ProcessTmpUploadCommand): Promise<void> {
    this.logger.log(
      `Processing tmp upload: ${dto.storageKey}, size: ${dto.fileSize}`,
    );

    const fileRecord = await this.fileRecordsRepository.findByStorageKey(
      dto.storageKey,
    );

    if (!fileRecord) {
      this.logger.warn(
        `FileRecord not found for storageKey: ${dto.storageKey}`,
      );
      return;
    }

    fileRecord.markUploaded(BigInt(dto.fileSize));
    await this.fileRecordsRepository.update(fileRecord);

    this.logger.log(`Copying to main bucket: ${dto.storageKey}`);
    await this.s3Service.copyToMain(dto.storageKey);

    this.logger.log(`Deleting from tmp bucket: ${dto.storageKey}`);
    await this.s3Service.deleteFromTmp(dto.storageKey);

    this.logger.log(`Tmp upload processed: ${dto.storageKey}`);
  }
}
