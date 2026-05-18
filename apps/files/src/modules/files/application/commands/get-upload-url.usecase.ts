import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { S3Service } from '../../../../infrastructure/s3/s3.service';
import { FilesRepository } from '../../infrastructure/files.repository';
import { FileEntity } from '../../domain/file.entity';
import { FileEntityType, FileStatus } from '@snaptix/common';

class GetUploadUrlCommandPayload {
  userId: string;
  fileName: string;
  mimeType: string;
  contentLengthBytes: number;
  fileEntityType: FileEntityType;
}

type GetUploadUrlCommandResult = { url: string; fileId: string };

export class GetUploadUrlCommand extends Command<GetUploadUrlCommandResult> {
  constructor(public readonly payload: GetUploadUrlCommandPayload) {
    super();
  }
}

@CommandHandler(GetUploadUrlCommand)
export class GetUploadUrlUseCase implements ICommandHandler<
  GetUploadUrlCommand,
  GetUploadUrlCommandResult
> {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute({
    payload,
  }: GetUploadUrlCommand): Promise<GetUploadUrlCommandResult> {
    const storageKey = `${payload.userId}/${payload.fileEntityType.toLowerCase()}/${randomUUID()}`;

    const entity = FileEntity.create({
      ownerId: payload.userId,
      status: FileStatus.PENDING,
      entityType: payload.fileEntityType,
      fileName: payload.fileName,
      mimeType: payload.mimeType,
      byteSize: payload.contentLengthBytes,
      storageKey,
    });

    const savedFile = await this.filesRepository.create(entity);

    const url = await this.s3Service.getPresignedUploadUrlFromTmpBucket(
      storageKey,
      payload.mimeType,
      payload.contentLengthBytes,
    );

    return { url, fileId: savedFile.id };
  }
}
