import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility, Environments } from '@snaptix/common';

@Injectable()
export class CoreConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number;

  @IsEnum(Environments, {
    message:
      'Set correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: Environments;

  @IsNotEmpty({
    message:
      'Set Env variable RABBITMQ_URI, example: amqp://username:password@localhost:5672',
  })
  rabbitmqUri: string;

  constructor(private configService: ConfigService<any, true>) {
    this.port = parseInt(this.configService.get<string>('PORT'));

    this.env = this.configService.get('NODE_ENV');

    this.rabbitmqUri = this.configService.get('RABBITMQ_URI');

    configValidationUtility.validateConfig(this);
  }
}
