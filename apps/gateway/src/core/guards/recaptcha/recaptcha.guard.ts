import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import axios, { AxiosResponse } from 'axios';
import { CoreConfig } from '../../config/core.config';
import { ForgotPasswordRequestDto } from '@snaptix/contracts';

type RecaptchaResponse = {
  success: boolean;
  challenge_ts: string; // timestamp of the challenge load (ISO format)
  hostname: string; // the hostname of the site where the reCAPTCHA was solved
  'error-codes': string[]; // optional
};

@Injectable()
export class RecaptchaGuard implements CanActivate {
  private logger = new Logger(RecaptchaGuard.name);

  constructor(private coreConfig: CoreConfig) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = (request.body as ForgotPasswordRequestDto)?.recaptchaToken;

    if (!token) {
      // throw new DomainException(GATEWAY_ERRORS.RECAPTCHA_INVALID);
      throw new ForbiddenException();
    }

    const response = await axios.request<any, AxiosResponse<RecaptchaResponse>>(
      {
        url: 'https://www.google.com/recaptcha/api/siteverify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: `secret=${this.coreConfig.recaptchaSecret}&response=${token}`,
      },
    );

    const data = response.data;

    this.logger.debug(data);

    if (!data.success) {
      // throw new DomainException(GATEWAY_ERRORS.RECAPTCHA_INVALID);
      throw new ForbiddenException();
    }

    return data.success;
  }
}
