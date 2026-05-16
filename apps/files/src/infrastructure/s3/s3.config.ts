import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '@snaptix/common';

export enum S3Provider {
  MINIO = 'minio',
  OTHER = 'other',
}

@Injectable()
export class S3Config {
  @IsEnum(S3Provider, {
    message: 'Set Env variable S3_PROVIDER: minio | other',
  })
  provider: S3Provider;

  @IsNotEmpty({
    message: 'Set Env variable S3_ENDPOINT, example: http://localhost:9000',
  })
  endpoint: string;

  @IsNotEmpty({
    message: 'Set Env variable S3_KEY_ID',
  })
  keyId: string;

  @IsNotEmpty({
    message: 'Set Env variable S3_SECRET_KEY',
  })
  secretKey: string;

  @IsNotEmpty({
    message: 'Set Env variable S3_TMP_BUCKET, example: snaptix-files',
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

  constructor(private configService: ConfigService<any, true>) {
    this.provider = this.configService.get('S3_PROVIDER');
    this.endpoint = this.configService.get('S3_ENDPOINT');
    this.keyId = this.configService.get('S3_KEY_ID');
    this.secretKey = this.configService.get('S3_SECRET_KEY');
    this.tmpBucket = this.configService.get('S3_TMP_BUCKET');
    this.mainBucket = this.configService.get('S3_MAIN_BUCKET');
    this.region = this.configService.get('S3_REGION');

    configValidationUtility.validateConfig(this);
  }
}
