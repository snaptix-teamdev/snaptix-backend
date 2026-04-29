import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import sharp from 'sharp';
import { FileRecordsRepository } from '../../infrastructure/file-records.repository';
import { FileVariantsRepository } from '../../infrastructure/file-variants.repository';
import { FileVariantEntity } from '../../domain/file-variant.entity';
import { S3Service } from '../../../../infrastructure/s3/s3.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const IMAGE_VARIANTS = [
  { width: 30, height: 30 },
  { width: 600, height: 600 },
] as const;

class ProcessMainUploadCommandRequest {
  storageKey: string;
}

export class ProcessMainUploadCommand extends Command<void> {
  constructor(public readonly dto: ProcessMainUploadCommandRequest) {
    super();
  }
}

@CommandHandler(ProcessMainUploadCommand)
export class ProcessMainUploadUseCase implements ICommandHandler<
  ProcessMainUploadCommand,
  void
> {
  constructor(
    private readonly fileRecordsRepository: FileRecordsRepository,
    private readonly fileVariantsRepository: FileVariantsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute({ dto }: ProcessMainUploadCommand): Promise<void> {
    const fileRecord = await this.fileRecordsRepository.findByStorageKey(
      dto.storageKey,
    );

    if (!fileRecord) return;

    if (fileRecord.fileSize && fileRecord.fileSize > BigInt(MAX_FILE_SIZE)) {
      fileRecord.markInvalid();
      await this.fileRecordsRepository.update(fileRecord);
      return;
    }

    if (fileRecord.mimeType.startsWith('image/')) {
      try {
        const buffer = await this.s3Service.getObjectBuffer(dto.storageKey);

        for (const { width, height } of IMAGE_VARIANTS) {
          const resized = await sharp(buffer)
            .resize(width, height, { fit: 'cover' })
            .toBuffer();

          const variantKey = `${dto.storageKey}_${width}x${height}`;

          await this.s3Service.putObject(
            variantKey,
            resized,
            fileRecord.mimeType,
          );

          const variant = FileVariantEntity.create({
            fileRecordId: fileRecord.id,
            width,
            height,
            storageKey: variantKey,
          });

          await this.fileVariantsRepository.create(variant);
        }

        fileRecord.markValid();
      } catch {
        fileRecord.markInvalid();
      }
    } else {
      fileRecord.markValid();
    }

    await this.fileRecordsRepository.update(fileRecord);
  }
}
