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
  ],
})
export class FilesFeatureModule {}
