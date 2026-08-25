import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility, Environments } from '@snaptix/common';

@Injectable()
export class CoreConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable MICROSERVICE_GEO_PORT, example: 3000',
    },
  )
  microserviceGeoPort: number;

  @IsNotEmpty({
    message: 'Set Env variable MICROSERVICE_GEO_HOST, example: 0.0.0.0',
  })
  microserviceGeoHost: string;

  @IsEnum(Environments, {
    message:
      'Set correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: Environments;

  constructor(private configService: ConfigService<any, true>) {
    this.microserviceGeoPort = parseInt(
      this.configService.get<string>('MICROSERVICE_GEO_PORT'),
    );

    this.microserviceGeoHost = this.configService.get('MICROSERVICE_GEO_HOST');

    this.env = this.configService.get('NODE_ENV');

    configValidationUtility.validateConfig(this);
  }
}
