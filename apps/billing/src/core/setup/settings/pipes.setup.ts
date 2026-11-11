import { ZodValidationPipe } from 'nestjs-zod';
import { NestExpressApplication } from '@nestjs/platform-express';

export function pipesSetup(app: NestExpressApplication): void {
  app.useGlobalPipes(new ZodValidationPipe());
}
