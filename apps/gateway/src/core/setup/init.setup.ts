import { NestExpressApplication } from '@nestjs/platform-express';
import { CoreConfig } from '../config/core.config';
import { cookieParserSetup } from './settings/cookie-parser.setup';
import { corsSetup } from './settings/cors.setup';
import { exceptionFilterSetup } from './settings/exception-filter.setup';
import { pipesSetup } from './settings/pipes.setup';
import { ipAddressSetup } from './settings/ip-address.setup';
import { swaggerSetup } from './settings/swagger.setup';
import { shutdownHooksSetup } from './settings/shutdown-hooks.setup';
import { globalPrefixSetup } from './settings/global-prefix.setup';
import { versioningSetup } from './settings/versioning.setup';

export function initSetup(app: NestExpressApplication): void {
  const coreConfig = app.get(CoreConfig);

  cookieParserSetup(app);
  exceptionFilterSetup(app);
  pipesSetup(app);
  ipAddressSetup(app);
  shutdownHooksSetup(app);
  globalPrefixSetup(app);
  versioningSetup(app);
  corsSetup(app, coreConfig);
  swaggerSetup(app, coreConfig);
}
