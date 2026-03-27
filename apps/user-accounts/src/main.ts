import { NestFactory } from '@nestjs/core';
import { UserAccountsModule } from './user-accounts.module';

async function bootstrap() {
  const app = await NestFactory.create(UserAccountsModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
