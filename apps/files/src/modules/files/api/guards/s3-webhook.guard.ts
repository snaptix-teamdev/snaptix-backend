import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { S3Config } from '../../../../infrastructure/s3/s3.config';

@Injectable()
export class S3WebhookGuard implements CanActivate {
  constructor(private readonly s3Config: S3Config) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string> }>();
    const auth = request.headers['authorization'];

    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    const token = auth.slice('Bearer '.length);

    if (token !== this.s3Config.webhookSecret) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
