import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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
  constructor(
    private readonly fileRecordsRepository: FileRecordsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute({ dto }: ProcessTmpUploadCommand): Promise<void> {
    const fileRecord = await this.fileRecordsRepository.findByStorageKey(
      dto.storageKey,
    );

    if (!fileRecord) return;

    fileRecord.markUploaded(BigInt(dto.fileSize));
    await this.fileRecordsRepository.update(fileRecord);

    await this.s3Service.copyToMain(dto.storageKey);
    await this.s3Service.deleteFromTmp(dto.storageKey);
  }
}
