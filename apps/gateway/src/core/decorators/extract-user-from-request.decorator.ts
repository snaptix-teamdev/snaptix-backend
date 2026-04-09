import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  UserContextDto,
  UserOptionalContextDto,
} from '../dto/user-context.dto';

interface RequestWithUser extends Request {
  user?: UserContextDto;
}

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDto => {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new Error(`There is no user in the request object`);
    }

    return request.user;
  },
);

export const ExtractUserOptionalFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserOptionalContextDto => {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    return request.user ?? { userId: null };
  },
);
