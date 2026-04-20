import { exceptionFilterSetup } from './settings/exception-filter.setup';
import { corsSetup } from './settings/cors.setup';
import { CoreConfig } from '../config/core.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { pipesSetup } from './settings/pipes.setup';
import { shutdownHooksSetup } from './settings/shutdown-hooks.setup';

export function initSetup(app: NestExpressApplication) {
  const coreConfig = app.get(CoreConfig);

  exceptionFilterSetup(app);
  pipesSetup(app);
  shutdownHooksSetup(app);
  corsSetup(app, coreConfig);
}
