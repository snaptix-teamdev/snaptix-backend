import { INestApplication } from '@nestjs/common';
import { MicroserviceExceptionFilter } from '@snaptix/core';

export function exceptionFilterSetup(app: INestApplication) {
  app.useGlobalFilters(new MicroserviceExceptionFilter());
}
