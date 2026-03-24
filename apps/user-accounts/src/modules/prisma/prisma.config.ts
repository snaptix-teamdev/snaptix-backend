import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '@snaptix/common/utils/config-validation.utility';

@Injectable()
export class PrismaConfig {
  @IsNotEmpty({
    message:
      'Set Env variable POSTGRES_USER_ACCOUNTS_URL, example: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public',
  })
  postgresUserAccountsUrl: string;

  constructor(private configService: ConfigService<any, true>) {
    this.postgresUserAccountsUrl = this.configService.get(
      'POSTGRES_USER_ACCOUNTS_URL',
    );

    configValidationUtility.validateConfig(this);
  }
}
