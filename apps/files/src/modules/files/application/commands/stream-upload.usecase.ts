import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';
import { DomainException } from '@snaptix/common';
import { FILES_ERRORS } from '@snaptix/contracts';
import { FileRecordEntity } from '../../domain/file-record.entity';
import { FileRecordsRepository } from '../../infrastructure/file-records.repository';
import { S3Service } from '../../../../infrastructure/s3/s3.service';
import { S3Config } from '../../../../infrastructure/s3/s3.config';
import { StreamUploadResponseDto } from '@snaptix/contracts';
import {
  FileValidationStream,
  FileTooLargeError,
  InvalidFileTypeError,
} from '../../domain/streams/file-validation.stream';

class StreamUploadCommandRequest {
  userId: string;
  fileName: string;
  mimeType: string;
  stream: Readable;
}

export class StreamUploadCommand extends Command<StreamUploadResponseDto> {
  constructor(public readonly dto: StreamUploadCommandRequest) {
    super();
  }
}

@CommandHandler(StreamUploadCommand)
export class StreamUploadUseCase implements ICommandHandler<
  StreamUploadCommand,
  StreamUploadResponseDto
> {
  constructor(
    private readonly fileRecordsRepository: FileRecordsRepository,
    private readonly s3Service: S3Service,
    private readonly s3Config: S3Config,
  ) {}

  async execute({
    dto,
  }: StreamUploadCommand): Promise<StreamUploadResponseDto> {
    const storageKey = `${dto.userId}/${randomUUID()}`;

    const entity = FileRecordEntity.create({
      userId: dto.userId,
      storageKey,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
    });

    const saved = await this.fileRecordsRepository.create(entity);

    const validationStream = new FileValidationStream(
      this.s3Config.maxUploadSizeBytes,
    );

    let fileBytesReceived = 0;
    dto.stream.on('data', (chunk: Buffer) => {
      fileBytesReceived += chunk.length;
      process.stdout.write(
        `\r[files] received: ${(fileBytesReceived / 1024 / 1024).toFixed(2)} MB`,
      );
    });
    dto.stream.once('end', () =>
      process.stdout.write(
        `\r[files] stream ended at: ${(fileBytesReceived / 1024 / 1024).toFixed(2)} MB\n`,
      ),
    );
    // Suppress ECONNRESET when the gateway closes the connection abruptly
    // (e.g., if the gateway process crashes or the client disconnects early).
    dto.stream.on('error', () => {});

    // Without this listener Node.js crashes on 'error' before our Promise
    // catch blocks execute. Errors are handled via validationStream.detection
    // (for pre-upload validation) and the putObjectStream catch (for size).
    validationStream.on('error', () => {});

    dto.stream.pipe(validationStream);

    // Wait for magic-byte detection before starting the S3 upload so the
    // multipart-upload initiation request carries the correct ContentType.
    let detectedMimeType: string;
    try {
      detectedMimeType = await validationStream.detection;
    } catch (err) {
      dto.stream.resume();
      if (err instanceof InvalidFileTypeError) {
        throw new DomainException(FILES_ERRORS.INVALID_FILE_TYPE);
      }
      if (err instanceof FileTooLargeError) {
        throw new DomainException(FILES_ERRORS.FILE_TOO_LARGE);
      }
      throw err;
    }

    try {
      await this.s3Service.putObjectStream(
        storageKey,
        validationStream,
        detectedMimeType,
      );
    } catch (err) {
      dto.stream.resume();
      if (err instanceof FileTooLargeError) {
        throw new DomainException(FILES_ERRORS.FILE_TOO_LARGE);
      }
      throw err;
    }

    saved.mimeType = detectedMimeType;
    saved.markUploaded(BigInt(validationStream.bytesTotal));
    saved.markValid();
    await this.fileRecordsRepository.update(saved);

    return { fileId: saved.id };
  }
}
