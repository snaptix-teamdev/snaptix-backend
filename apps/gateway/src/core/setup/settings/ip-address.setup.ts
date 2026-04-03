import { NestExpressApplication } from '@nestjs/platform-express';

export function ipAddressSetup(app: NestExpressApplication): void {
  app.set('trust proxy', true);
}
