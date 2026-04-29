import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '@snaptix/common';

@Injectable()
export class S3Config {
  @IsNotEmpty({
    message: 'Set Env variable MINIO_ENDPOINT, example: http://localhost:9000',
  })
  endpoint: string;

  @IsNotEmpty({
    message: 'Set Env variable MINIO_ACCESS_KEY',
  })
  accessKey: string;

  @IsNotEmpty({
    message: 'Set Env variable MINIO_SECRET_KEY',
  })
  secretKey: string;

  @IsNotEmpty({
    message: 'Set Env variable MINIO_TMP_BUCKET, example: snaptix-files-tmp',
  })
  tmpBucket: string;

  @IsNotEmpty({
    message: 'Set Env variable MINIO_MAIN_BUCKET, example: snaptix-files',
  })
  mainBucket: string;

  @IsNotEmpty({
    message: 'Set Env variable MINIO_REGION, example: us-east-1',
  })
  region: string;

  @IsNotEmpty({
    message: 'Set Env variable S3_WEBHOOK_SECRET',
  })
  webhookSecret: string;

  readonly presignedUploadTtlSeconds = 300;
  readonly presignedDownloadTtlSeconds = 30;

  constructor(private configService: ConfigService<any, true>) {
    this.endpoint = this.configService.get('MINIO_ENDPOINT');
    this.accessKey = this.configService.get('MINIO_ACCESS_KEY');
    this.secretKey = this.configService.get('MINIO_SECRET_KEY');
    this.tmpBucket = this.configService.get('MINIO_TMP_BUCKET');
    this.mainBucket = this.configService.get('MINIO_MAIN_BUCKET');
    this.region = this.configService.get('MINIO_REGION');
    this.webhookSecret = this.configService.get('S3_WEBHOOK_SECRET');

    configValidationUtility.validateConfig(this);
  }
}
