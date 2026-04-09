import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsNotEmpty, IsNumber, NotEquals } from 'class-validator';
import { configValidationUtility } from '@snaptix/common';

@Injectable()
export class EmailConfig {
  @IsNotEmpty({
    message: 'Set Env variable MAIL_HOST, example: smtp.mail.ru',
  })
  mailHost: string;

  @NotEquals(0, {
    message: 'Env variable MAIL_PORT must be > 0, example: 465',
  })
  @IsNumber(
    {},
    {
      message: 'Set Env variable MAIL_PORT, example: 465',
    },
  )
  mailPort: number;

  @IsNotEmpty({
    message: 'Set Env variable MAIL_USER, example: example@mail.ru',
  })
  mailUser: string;

  @IsNotEmpty({
    message: 'Set Env variable MAIL_PASS, example: passwordForMail',
  })
  mailPass: string;

  @IsBoolean({
    message:
      'Set Env variable MAIL_USE_SECURE. For production - true, example: true, available values: true, false, 1, 0',
  })
  mailUseSecure: boolean;

  @IsBoolean({
    message:
      'Set Env variable MAIL_IGNORE_TLS. For production - false, example: true, available values: true, false, 1, 0',
  })
  mailIgnoreTLS: boolean;

  constructor(private configService: ConfigService<any, true>) {
    this.mailHost = this.configService.get<string>('MAIL_HOST');

    this.mailPort = Number.parseInt(
      this.configService.get<string>('MAIL_PORT'),
    );

    this.mailUser = this.configService.get<string>('MAIL_USER');

    this.mailPass = this.configService.get<string>('MAIL_PASS');

    this.mailUseSecure = configValidationUtility.convertToBoolean(
      this.configService.get('MAIL_USE_SECURE'),
    ) as boolean;

    this.mailIgnoreTLS = configValidationUtility.convertToBoolean(
      this.configService.get('MAIL_IGNORE_TLS'),
    ) as boolean;

    configValidationUtility.validateConfig(this);
  }
}
