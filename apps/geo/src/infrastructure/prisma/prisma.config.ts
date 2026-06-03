import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '@snaptix/common/utils/config-validation.utility';

@Injectable()
export class PrismaConfig {
  @IsNotEmpty({
    message:
      'Set Env variable POSTGRES_GEO_URL, example: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public',
  })
  postgresGeoUrl: string;

  constructor(private configService: ConfigService<any, true>) {
    this.postgresGeoUrl = this.configService.get('POSTGRES_GEO_URL');

    configValidationUtility.validateConfig(this);
  }
}
