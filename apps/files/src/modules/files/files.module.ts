import { Module } from '@nestjs/common';
import { FilesController } from './api/files.controller';
import { FileRecordConverter } from './converter/file-record.converter';
import { FileRecordsRepository } from './infrastructure/file-records.repository';
import { GetUploadUrlUseCase } from './application/commands/get-upload-url.usecase';
import { GetDownloadUrlUseCase } from './application/commands/get-download-url.usecase';
import { RevokeFileAccessUseCase } from './application/commands/revoke-file-access.usecase';
import { S3Module } from '../../infrastructure/s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [FilesController],
  providers: [
    FileRecordConverter,
    FileRecordsRepository,
    GetUploadUrlUseCase,
    GetDownloadUrlUseCase,
    RevokeFileAccessUseCase,
  ],
})
export class FilesFeatureModule {}
