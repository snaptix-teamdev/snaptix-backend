import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsArray, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
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
      message: 'Set Env variable MICROSERVICE_POSTS_PORT, example: 3000',
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
    message:
      'Set Env variable RABBITMQ_URI, example: amqp://username:password@localhost:5672',
  })
  rabbitmqUri: string;

  constructor(private configService: ConfigService<any, true>) {
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

    this.rabbitmqUri = this.configService.get('RABBITMQ_URI');

    configValidationUtility.validateConfig(this);
  }
}
