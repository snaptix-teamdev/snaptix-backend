import { GatewayExceptionFilter } from '../../filters/gateway-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';

export function exceptionFilterSetup(app: NestExpressApplication): void {
  app.useGlobalFilters(new GatewayExceptionFilter());
}
