import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { DomainException, UserOAuthContextDto } from '@snaptix/common';
import { COMMON_ERRORS } from '@snaptix/contracts';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super({
      session: false,
    });
  }

  handleRequest<TUser = UserOAuthContextDto>(err: any, user: TUser): TUser {
    if (err) {
      throw err;
    }

    if (!user) {
      throw new DomainException(COMMON_ERRORS.UNAUTHORIZED_ERROR);
    }
    return user;
  }

  // async canActivate(context: ExecutionContext) {
  //   const activate = (await super.canActivate(context)) as boolean;
  //   const request = context.switchToHttp().getRequest<Request>();
  //   await super.logIn(request);
  //   return activate;
  // }
}
