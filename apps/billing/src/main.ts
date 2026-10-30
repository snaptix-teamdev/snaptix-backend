import { NestFactory } from '@nestjs/core';
import { initSetup } from './core/setup/init.setup';
import { Logger } from '@nestjs/common';
import { CoreConfig } from './core/config/core.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Billing');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const coreConfig = app.get(CoreConfig);

  initSetup(app);

  await app.listen(coreConfig.port, () => {
    logger.log(`✅  Server running on port: ${coreConfig.port}`);
  });
}
void bootstrap();
