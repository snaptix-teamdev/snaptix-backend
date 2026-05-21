import { Module } from '@nestjs/common';
import { FilesController } from './api/files.controller';
import { FileConverter } from './converter/file.converter';
import { FileVariantConverter } from './converter/file-variant.converter';
import { FilesRepository } from './infrastructure/files.repository';
import { FileVariantsRepository } from './infrastructure/file-variants.repository';
import { GetUploadUrlUseCase } from './application/commands/get-upload-url.usecase';
import { S3Module } from '../../infrastructure/s3/s3.module';
import { ConfirmUploadFileUseCase } from './application/commands/confirm-upload-file.use-case';
import { FileValidationService } from './application/file-validation.service';
import { LinkFileToEntityUseCase } from './application/commands/link-file-to-entity.use-case';
import { BulkLinkFilesToEntityUseCase } from './application/commands/bulk-link-files-to-entity.use-case';
import { DeletePostFilesUseCase } from './application/commands/delete-post-files.use-case';
import { PostDeletedHandler } from './events/post-deleted.handler';
import { PostDeletedDeadLetterHandler } from './events/post-deleted-dead-letter.handler';

@Module({
  imports: [S3Module],
  controllers: [FilesController],
  providers: [
    FileConverter,
    FileVariantConverter,
    FilesRepository,
    FileVariantsRepository,
    GetUploadUrlUseCase,
    GetUploadUrlUseCase,
    ConfirmUploadFileUseCase,
    FileValidationService,
    LinkFileToEntityUseCase,
    BulkLinkFilesToEntityUseCase,
    DeletePostFilesUseCase,
    PostDeletedHandler,
    PostDeletedDeadLetterHandler,
  ],
})
export class FilesFeatureModule {}
