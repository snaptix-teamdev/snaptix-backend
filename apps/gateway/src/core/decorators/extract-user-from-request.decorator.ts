import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  UserContextDTO,
  UserOptionalContextDTO,
} from '../dto/user-context.dto';

interface RequestWithUser extends Request {
  user?: UserContextDTO;
}

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDTO => {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new Error(`There is no user in the request object`);
    }

    return request.user;
  },
);

export const ExtractUserOptionalFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserOptionalContextDTO => {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    return request.user ?? { userId: null };
  },
);
