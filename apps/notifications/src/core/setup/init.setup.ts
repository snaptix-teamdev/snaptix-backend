import { exceptionFilterSetup } from './settings/exception-filter.setup';
import { NestExpressApplication } from '@nestjs/platform-express';
import { pipesSetup } from './settings/pipes.setup';
import { shutdownHooksSetup } from './settings/shutdown-hooks.setup';

export function initSetup(app: NestExpressApplication) {
  exceptionFilterSetup(app);
  pipesSetup(app);
  shutdownHooksSetup(app);
}
