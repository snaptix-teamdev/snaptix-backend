import { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';

export function versioningSetup(app: NestExpressApplication) {
  app.enableVersioning({
    type: VersioningType.URI,
  });
}
