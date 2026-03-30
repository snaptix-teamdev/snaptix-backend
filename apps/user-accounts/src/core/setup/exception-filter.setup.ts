import { INestApplication } from '@nestjs/common';
import { GlobalExceptionFilter } from '../filters/global.exception-filter';

export function exceptionFilterSetup(app: INestApplication) {
  app.useGlobalFilters(new GlobalExceptionFilter());
}
