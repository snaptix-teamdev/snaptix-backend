import { NestFactory } from '@nestjs/core';
import { UserAccountsModule } from './user-accounts.module';
import { initSetup } from './core/setup/init.setup';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(UserAccountsModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 9000,
    },
  });

  await app.startAllMicroservices();

  initSetup(app);
  app.setGlobalPrefix('api');
  app.enableCors();

  await app.listen(process.env.port ?? 3000, () => {
    console.log(
      'User accounts microservice is running on port:',
      process.env.port,
    );
  });
}
void bootstrap();
