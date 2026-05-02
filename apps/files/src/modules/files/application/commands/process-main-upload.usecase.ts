import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import sharp = require('sharp');
import { FileRecordsRepository } from '../../infrastructure/file-records.repository';
import { FileVariantsRepository } from '../../infrastructure/file-variants.repository';
import { FileVariantEntity } from '../../domain/file-variant.entity';
import { S3Service } from '../../../../infrastructure/s3/s3.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const IMAGE_VARIANTS = [
  { width: 30, height: 30 },
  { width: 300, height: 300 },
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
  private readonly logger = new Logger(ProcessMainUploadUseCase.name);

  constructor(
    private readonly fileRecordsRepository: FileRecordsRepository,
    private readonly fileVariantsRepository: FileVariantsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute({ dto }: ProcessMainUploadCommand): Promise<void> {
    this.logger.log(`Processing main upload: ${dto.storageKey}`);

    const fileRecord = await this.fileRecordsRepository.findByStorageKey(
      dto.storageKey,
    );

    if (!fileRecord) {
      this.logger.warn(
        `FileRecord not found for storageKey: ${dto.storageKey}`,
      );
      return;
    }

    if (fileRecord.fileSize && fileRecord.fileSize > BigInt(MAX_FILE_SIZE)) {
      this.logger.warn(`File too large: ${fileRecord.fileSize} bytes`);
      fileRecord.markInvalid();
      await this.fileRecordsRepository.update(fileRecord);
      return;
    }

    if (fileRecord.mimeType.startsWith('image/')) {
      try {
        this.logger.log(`Downloading buffer for resize: ${dto.storageKey}`);
        const buffer = await this.s3Service.getObjectBuffer(dto.storageKey);

        for (const { width, height } of IMAGE_VARIANTS) {
          this.logger.log(`Resizing to ${width}x${height}`);
          const resized = await sharp(buffer)
            .resize(width, height, {
              fit: 'contain',
              background: { r: 50, g: 50, b: 50, alpha: 1 },
            })
            .webp()
            .toBuffer();

          const variantKey = `${dto.storageKey}_${width}x${height}.webp`;

          await this.s3Service.putObject(variantKey, resized, 'image/webp');
          this.logger.log(`Variant saved to S3: ${variantKey}`);

          const variant = FileVariantEntity.create({
            fileRecordId: fileRecord.id,
            width,
            height,
            storageKey: variantKey,
          });

          await this.fileVariantsRepository.create(variant);
          this.logger.log(`Variant saved to DB: ${variantKey}`);
        }

        fileRecord.markValid();
        this.logger.log(`File processed successfully: ${dto.storageKey}`);
      } catch (err) {
        this.logger.error(`Failed to process image: ${dto.storageKey}`, err);
        fileRecord.markInvalid();
      }
    } else {
      fileRecord.markValid();
      this.logger.log(`Non-image file marked valid: ${dto.storageKey}`);
    }

    await this.fileRecordsRepository.update(fileRecord);
  }
}
