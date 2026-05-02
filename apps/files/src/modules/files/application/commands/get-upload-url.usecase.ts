import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IFileRecord } from '@snaptix/common';
import { randomUUID } from 'crypto';
import { FileRecordsRepository } from '../../infrastructure/file-records.repository';
import { FileRecordEntity } from '../../domain/file-record.entity';
import { S3Service } from '../../../../infrastructure/s3/s3.service';
import { GetUploadUrlResponseDto } from '@snaptix/contracts';

class GetUploadUrlCommandRequest {
  userId: string;
  fileName: string;
  mimeType: string;
}

export class GetUploadUrlCommand extends Command<GetUploadUrlResponseDto> {
  constructor(public readonly dto: GetUploadUrlCommandRequest) {
    super();
  }
}

@CommandHandler(GetUploadUrlCommand)
export class GetUploadUrlUseCase implements ICommandHandler<
  GetUploadUrlCommand,
  GetUploadUrlResponseDto
> {
  constructor(
    private readonly fileRecordsRepository: FileRecordsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute({
    dto,
  }: GetUploadUrlCommand): Promise<GetUploadUrlResponseDto> {
    const storageKey = `${dto.userId}/${randomUUID()}`;

    const entity = FileRecordEntity.create({
      userId: dto.userId,
      storageKey,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
    });

    const saved: Pick<IFileRecord, 'id'> =
      await this.fileRecordsRepository.create(entity);

    const { url, fields } =
      await this.s3Service.getPresignedUploadPost(storageKey);

    return { fileId: saved.id, url, fields };
  }
}
