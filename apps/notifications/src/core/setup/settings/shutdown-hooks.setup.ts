import { NestExpressApplication } from '@nestjs/platform-express';

export function shutdownHooksSetup(app: NestExpressApplication): void {
  app.enableShutdownHooks();
}
