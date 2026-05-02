import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '@snaptix/common';

export enum S3Provider {
  MINIO = 'minio',
  YANDEX = 'yandex',
}

@Injectable()
export class S3Config {
  @IsEnum(S3Provider, {
    message: 'Set Env variable S3_PROVIDER: minio | yandex',
  })
  provider: S3Provider;

  @IsNotEmpty({
    message: 'Set Env variable S3_ENDPOINT, example: http://localhost:9000',
  })
  endpoint: string;

  @IsNotEmpty({
    message: 'Set Env variable S3_ACCESS_KEY',
  })
  accessKey: string;

  @IsNotEmpty({
    message: 'Set Env variable S3_SECRET_KEY',
  })
  secretKey: string;

  @IsNotEmpty({
    message: 'Set Env variable S3_TMP_BUCKET, example: snaptix-files-tmp',
  })
  tmpBucket: string;

  @IsNotEmpty({
    message: 'Set Env variable S3_MAIN_BUCKET, example: snaptix-files',
  })
  mainBucket: string;

  @IsNotEmpty({
    message: 'Set Env variable S3_REGION, example: us-east-1',
  })
  region: string;

  @IsNotEmpty({
    message: 'Set Env variable S3_WEBHOOK_SECRET',
  })
  webhookSecret: string;

  readonly presignedUploadTtlSeconds = 30;
  readonly presignedDownloadTtlSeconds = 30;
  readonly maxUploadSizeBytes = 10 * 1024 * 1024; // 10 MB

  constructor(private configService: ConfigService<any, true>) {
    this.provider = this.configService.get('S3_PROVIDER');
    this.endpoint = this.configService.get('S3_ENDPOINT');
    this.accessKey = this.configService.get('S3_ACCESS_KEY');
    this.secretKey = this.configService.get('S3_SECRET_KEY');
    this.tmpBucket = this.configService.get('S3_TMP_BUCKET');
    this.mainBucket = this.configService.get('S3_MAIN_BUCKET');
    this.region = this.configService.get('S3_REGION');
    this.webhookSecret = this.configService.get('S3_WEBHOOK_SECRET');

    configValidationUtility.validateConfig(this);
  }
}
