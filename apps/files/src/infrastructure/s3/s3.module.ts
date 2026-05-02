import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Config } from './s3.config';
import { MinioSetupService } from './minio-setup.service';

@Module({
  providers: [S3Service, S3Config, MinioSetupService],
  exports: [S3Service, S3Config],
})
export class S3Module {}
