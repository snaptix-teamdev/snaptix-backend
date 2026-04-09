import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSetup } from './core/setup/init.setup';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CoreConfig } from './core/config/core.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Gateway');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const coreConfig = app.get(CoreConfig);

  initSetup(app);

  await app.listen(coreConfig.port, () => {
    logger.log(`✅  Server running on port ${coreConfig.port}`);
    logger.log(`http://localhost:${coreConfig.port}/swagger`);
  });
}
void bootstrap();
