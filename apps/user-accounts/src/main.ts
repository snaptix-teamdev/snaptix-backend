import { NestFactory } from '@nestjs/core';
import { UserAccountsModule } from './user-accounts.module';
import { initSetup } from './core/setup/init.setup';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { CoreConfig } from './core/config/core.config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger('UserAccounts');

  const app =
    await NestFactory.create<NestExpressApplication>(UserAccountsModule);

  const coreConfig = app.get(CoreConfig);

  initSetup(app);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.TCP,
      options: {
        host: coreConfig.microserviceUserAccountsHost,
        port: coreConfig.microserviceUserAccountsPort,
      },
    },
    {
      inheritAppConfig: true,
    },
  );

  await app.startAllMicroservices();

  await app.init();
  logger.log(
    `✅  Microservice running on port: ${coreConfig.microserviceUserAccountsPort}`,
  );
}
void bootstrap();
