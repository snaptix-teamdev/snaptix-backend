import { NestFactory } from '@nestjs/core';
import { initSetup } from './core/setup/init.setup';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { CoreConfig } from './core/config/core.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { FilesModule } from './files.module';

async function bootstrap() {
  const logger = new Logger('Files');

  const app = await NestFactory.create<NestExpressApplication>(FilesModule);

  const coreConfig = app.get(CoreConfig);

  initSetup(app);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.TCP,
      options: {
        host: coreConfig.microserviceFilesHost,
        port: coreConfig.microserviceFilesPort,
      },
    },
    {
      inheritAppConfig: true,
    },
  );

  await app.startAllMicroservices();

  await app.listen(9010);
  logger.log(
    `✅  Microservice running on port: ${coreConfig.microserviceFilesPort}`,
  );
}
void bootstrap();
