import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '@snaptix/common';

@Injectable()
export class GatewayConfig {
  @IsNotEmpty({
    message:
      'Set Env variable FILES_STORAGE_BASE_URL, example: https://storage.yandexcloud.net/snaptix-files',
  })
  filesStorageBaseUrl: string;

  constructor(private configService: ConfigService<any, true>) {
    this.filesStorageBaseUrl = this.configService.get('FILES_STORAGE_BASE_URL');

    configValidationUtility.validateConfig(this);
  }
}
