import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ExtractClientDetails = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return {
      ip: request.ip || '',
      deviceName: request.headers['user-agent'] || '',
    };
  },
);
