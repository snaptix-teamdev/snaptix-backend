import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  UserContextDto,
  UserOAuthContextDto,
  UserOptionalContextDto,
} from '@snaptix/common/dto/user-context.dto';

interface RequestWithUser<TUser> extends Request {
  user?: TUser;
}

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDto => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithUser<UserContextDto>>();

    if (!request.user) {
      throw new Error(`There is no user in the request object`);
    }

    return request.user;
  },
);

export const ExtractUserOptionalFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserOptionalContextDto => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithUser<UserOptionalContextDto>>();

    return request.user ?? { userId: null };
  },
);

export const ExtractOAuthUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserOAuthContextDto => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithUser<UserOAuthContextDto>>();

    if (!request.user) {
      throw new Error(`There is no user in the request object`);
    }

    return request.user;
  },
);
