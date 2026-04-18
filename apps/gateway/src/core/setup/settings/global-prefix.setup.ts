import { NestExpressApplication } from '@nestjs/platform-express';

export function globalPrefixSetup(app: NestExpressApplication) {
  app.setGlobalPrefix('api');
}
