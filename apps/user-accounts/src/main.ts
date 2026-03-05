import { NestFactory } from '@nestjs/core';
import { UserAccountsModule } from './user-accounts.module';

async function bootstrap() {
  const app = await NestFactory.create(UserAccountsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
