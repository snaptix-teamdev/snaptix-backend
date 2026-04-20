import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '@snaptix/common/utils/config-validation.utility';

@Injectable()
export class PrismaConfig {
  @IsNotEmpty({
    message:
      'Set Env variable POSTGRES_FILES_URL, example: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public',
  })
  postgresFilesUrl: string;

  constructor(private configService: ConfigService<any, true>) {
    this.postgresFilesUrl = this.configService.get('POSTGRES_FILES_URL');

    configValidationUtility.validateConfig(this);
  }
}
