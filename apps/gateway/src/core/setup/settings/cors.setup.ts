import { NestExpressApplication } from '@nestjs/platform-express';
import { CoreConfig } from '../../config/core.config';
import { Environments } from '@snaptix/common';

export function corsSetup(
  app: NestExpressApplication,
  coreConfig: CoreConfig,
): void {
  const allowedOrigins =
    coreConfig.env === Environments.PRODUCTION
      ? coreConfig.corsAllowedOrigins
      : true;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
}
