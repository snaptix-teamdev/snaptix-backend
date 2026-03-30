import { INestApplication } from '@nestjs/common';
import { exceptionFilterSetup } from './exception-filter.setup';

export function initSetup(app: INestApplication) {
  exceptionFilterSetup(app);
}
