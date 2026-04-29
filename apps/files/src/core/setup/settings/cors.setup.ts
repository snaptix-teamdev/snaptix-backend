import { NestExpressApplication } from '@nestjs/platform-express';
import { Environments } from '@snaptix/common';
import { CoreConfig } from '../../config/core.config';

export function corsSetup(
  app: NestExpressApplication,
  coreConfig: CoreConfig,
): void {
  const allowedOrigins =
    coreConfig.env === Environments.PRODUCTION
      ? coreConfig.corsAllowedOrigins
      : '*';

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
}
