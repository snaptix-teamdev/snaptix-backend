import { NestFactory } from '@nestjs/core';
import { initSetup } from './core/setup/init.setup';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { CoreConfig } from './core/config/core.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PostsModule } from './posts.module';

async function bootstrap() {
  const logger = new Logger('Posts');

  const app = await NestFactory.create<NestExpressApplication>(PostsModule);

  const coreConfig = app.get(CoreConfig);

  initSetup(app);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.TCP,
      options: {
        host: coreConfig.microservicePostsHost,
        port: coreConfig.microservicePostsPort,
      },
    },
    {
      inheritAppConfig: true,
    },
  );

  await app.startAllMicroservices();

  await app.init();
  logger.log(
    `✅  Microservice running on port: ${coreConfig.microservicePostsPort}`,
  );
}
void bootstrap();
