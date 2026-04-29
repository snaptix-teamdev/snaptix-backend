import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Config } from './s3.config';

@Module({
  providers: [S3Service, S3Config],
  exports: [S3Service],
})
export class S3Module {}
