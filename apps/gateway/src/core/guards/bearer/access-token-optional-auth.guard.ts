import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenOptionalAuthGuard extends AuthGuard('accessToken') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      return null;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return user;
    }
  }
}
