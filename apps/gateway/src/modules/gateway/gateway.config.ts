import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '@snaptix/common';

@Injectable()
export class GatewayConfig {
  @IsNotEmpty({
    message: 'Set Env variable GOOGLE_CLIENT_ID',
  })
  googleClientId: string;

  @IsNotEmpty({
    message: 'Set Env variable GOOGLE_CLIENT_SECRET',
  })
  googleClientSecret: string;

  @IsNotEmpty({
    message:
      'Set Env variable GOOGLE_CALLBACK_URL, example: http://localhost:9000/api/v1/auth/google/redirect',
  })
  googleCallbackUrl: string;

  @IsNotEmpty({
    message:
      'Set Env variable FILES_STORAGE_BASE_URL, example: https://storage.yandexcloud.net/snaptix-files',
  })
  filesStorageBaseUrl: string;

  constructor(private configService: ConfigService<any, true>) {
    this.filesStorageBaseUrl = this.configService.get('FILES_STORAGE_BASE_URL');
    this.googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    this.googleClientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.googleCallbackUrl = this.configService.get('GOOGLE_CALLBACK_URL');

    configValidationUtility.validateConfig(this);
  }
}
