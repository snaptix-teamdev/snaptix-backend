import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ExtractClientDetails = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const ip = request.ip ?? null;
    const userAgent = request.headers['user-agent'] || '';

    return { ip, userAgent };
  },
);
