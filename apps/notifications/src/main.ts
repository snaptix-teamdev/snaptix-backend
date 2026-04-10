import { NestFactory } from '@nestjs/core';
import { initSetup } from './core/setup/init.setup';
import { Logger } from '@nestjs/common';
import { CoreConfig } from './core/config/core.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NotificationsModule } from './notifications.module';
import { Environments } from '@snaptix/common';

async function bootstrap() {
  const logger = new Logger('UserAccounts');

  const app =
    await NestFactory.create<NestExpressApplication>(NotificationsModule);

  const coreConfig = app.get(CoreConfig);

  initSetup(app);

  await app.listen(coreConfig.port, () => {
    logger.log(`✅  Server running on port: ${coreConfig.port}`);

    if (coreConfig.env !== Environments.PRODUCTION) {
      logger.log(`MailDev Service: http://localhost:1080`);
    }
  });
}
void bootstrap();
