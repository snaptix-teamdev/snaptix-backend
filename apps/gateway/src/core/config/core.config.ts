import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import {
  configValidationUtility,
  Environments,
  parseCommaSeparatedStringToArrayUtil,
} from '@snaptix/common';

@Injectable()
export class CoreConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number;

  @IsNumber(
    {},
    {
      message:
        'Set Env variable MICROSERVICE_USER_ACCOUNTS_PORT, example: 3001',
    },
  )
  microserviceUserAccountsPort: number;

  @IsNotEmpty({
    message:
      'Set Env variable MICROSERVICE_USER_ACCOUNTS_HOST, example: 0.0.0.0',
  })
  microserviceUserAccountsHost: string;

  @IsNumber(
    {},
    {
      message: 'Set Env variable MICROSERVICE_FILES_PORT, example: 9004',
    },
  )
  microserviceFilesPort: number;

  @IsNotEmpty({
    message: 'Set Env variable MICROSERVICE_FILES_HOST, example: 0.0.0.0',
  })
  microserviceFilesHost: string;

  @IsNumber(
    {},
    {
      message: 'Set Env variable MICROSERVICE_POSTS_PORT, example: 9005',
    },
  )
  microservicePostsPort: number;

  @IsNotEmpty({
    message: 'Set Env variable MICROSERVICE_POSTS_HOST, example: 0.0.0.0',
  })
  microservicePostsHost: string;

  @IsEnum(Environments, {
    message:
      'Set correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: Environments;

  @IsArray({
    message:
      'Set Env variable CORS_ALLOWED_ORIGINS, example: https://ya.ru,https://google.com',
  })
  corsAllowedOrigins: string[];

  @IsNotEmpty({
    message: 'Set Env variable RECAPTCHA_SECRET, dangerous for security!',
  })
  recaptchaSecret: string;

  @IsBoolean({
    message:
      'Set Env variable IS_SWAGGER_ENABLED to enable/disable Swagger, example: true, available values: true, false, 1, 0',
  })
  isSwaggerEnabled: boolean;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string;

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string;

  constructor(private configService: ConfigService<any, true>) {
    this.port = parseInt(this.configService.get<string>('PORT'));

    this.microserviceUserAccountsPort = parseInt(
      this.configService.get<string>('MICROSERVICE_USER_ACCOUNTS_PORT'),
    );

    this.microserviceUserAccountsHost = this.configService.get(
      'MICROSERVICE_USER_ACCOUNTS_HOST',
    );

    this.microserviceFilesPort = parseInt(
      this.configService.get<string>('MICROSERVICE_FILES_PORT'),
    );

    this.microserviceFilesHost = this.configService.get(
      'MICROSERVICE_FILES_HOST',
    );

    this.microservicePostsPort = parseInt(
      this.configService.get<string>('MICROSERVICE_POSTS_PORT'),
    );

    this.microservicePostsHost = this.configService.get(
      'MICROSERVICE_POSTS_HOST',
    );

    this.env = this.configService.get('NODE_ENV');

    this.corsAllowedOrigins = parseCommaSeparatedStringToArrayUtil(
      this.configService.get<string>('CORS_ALLOWED_ORIGINS'),
    );

    this.recaptchaSecret = this.configService.get('RECAPTCHA_SECRET');

    this.isSwaggerEnabled = configValidationUtility.convertToBoolean(
      this.configService.get('IS_SWAGGER_ENABLED'),
    ) as boolean;

    this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');

    configValidationUtility.validateConfig(this);
  }
}
