import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const ExtractRefreshTokenFromCookie = createParamDecorator(
  (_data: never, ctx: ExecutionContext): string => {
    const logger = new Logger('ExtractRefreshTokenFromCookie');

    const request = ctx.switchToHttp().getRequest<Request>();

    if (!(typeof request.cookies?.refreshToken === 'string')) {
      logger.error('refreshToken not found');

      throw new UnauthorizedException();
    }

    return request.cookies.refreshToken;
  },
);
