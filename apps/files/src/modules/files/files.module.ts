import { Module } from '@nestjs/common';
import { FilesController } from './api/files.controller';
import { S3WebhooksController } from './api/s3-webhooks.controller';
import { S3WebhookGuard } from './api/guards/s3-webhook.guard';
import { FileRecordConverter } from './converter/file-record.converter';
import { FileVariantConverter } from './converter/file-variant.converter';
import { FileRecordsRepository } from './infrastructure/file-records.repository';
import { FileVariantsRepository } from './infrastructure/file-variants.repository';
import { GetUploadUrlUseCase } from './application/commands/get-upload-url.usecase';
import { GetDownloadUrlUseCase } from './application/commands/get-download-url.usecase';
import { RevokeFileAccessUseCase } from './application/commands/revoke-file-access.usecase';
import { ProcessTmpUploadUseCase } from './application/commands/process-tmp-upload.usecase';
import { ProcessMainUploadUseCase } from './application/commands/process-main-upload.usecase';
import { S3Module } from '../../infrastructure/s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [FilesController, S3WebhooksController],
  providers: [
    S3WebhookGuard,
    FileRecordConverter,
    FileVariantConverter,
    FileRecordsRepository,
    FileVariantsRepository,
    GetUploadUrlUseCase,
    GetDownloadUrlUseCase,
    RevokeFileAccessUseCase,
    ProcessTmpUploadUseCase,
    ProcessMainUploadUseCase,
  ],
})
export class FilesFeatureModule {}
