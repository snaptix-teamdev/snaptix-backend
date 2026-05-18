import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Service } from '../../../../infrastructure/s3/s3.service';
import { FilesRepository } from '../../infrastructure/files.repository';
import { DomainException } from '@snaptix/common';
import { FILES_ERRORS } from '@snaptix/contracts';
import { FileValidationService } from '../file-validation.service';

class ConfirmUploadUrlCommandPayload {
  userId: string;
  fileId: string;
}

type ConfirmUploadFileCommandResult = void;

export class ConfirmUploadFileCommand extends Command<ConfirmUploadFileCommandResult> {
  constructor(public readonly payload: ConfirmUploadUrlCommandPayload) {
    super();
  }
}

@CommandHandler(ConfirmUploadFileCommand)
export class ConfirmUploadFileUseCase implements ICommandHandler<
  ConfirmUploadFileCommand,
  ConfirmUploadFileCommandResult
> {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly fileValidationService: FileValidationService,
    private readonly s3Service: S3Service,
  ) {}

  async execute({
    payload,
  }: ConfirmUploadFileCommand): Promise<ConfirmUploadFileCommandResult> {
    const file = await this.filesRepository.findById(payload.fileId);

    if (!file) {
      throw new DomainException(FILES_ERRORS.FILE_NOT_FOUND);
    }

    if (file.isConfirmed()) {
      throw new DomainException(FILES_ERRORS.FILE_ALREADY_CONFIRMED);
    }

    const result = await this.fileValidationService.validateMimeType(
      file.storageKey,
      ['image/jpeg', 'image/png'],
    );

    if (result.status === 'fileNotUploaded') {
      throw new DomainException(FILES_ERRORS.FILE_NOT_UPLOADED);
    }

    if (result.status === 'invalid') {
      file.markAsInvalid(result.detectedMimeType);
      await this.filesRepository.update(file);
      throw new DomainException(FILES_ERRORS.FILE_MIME_TYPE_NOT_SUPPORTED);
    }

    const oldStorageKey = file.storageKey;
    const newStorageKey = `${file.storageKey}.${result.ext}`;

    file.markAsConfirmed(result.detectedMimeType, newStorageKey);
    await this.s3Service.copyFromTmpToMainBucket(oldStorageKey, newStorageKey);

    await this.filesRepository.update(file);
  }
}
