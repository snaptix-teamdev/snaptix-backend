import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

export function cookieParserSetup(app: NestExpressApplication): void {
  app.use(cookieParser());
}
