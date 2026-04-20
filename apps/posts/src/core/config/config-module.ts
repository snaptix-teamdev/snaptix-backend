import { ConfigModule } from '@nestjs/config';
import { envFilePath } from '@snaptix/common';

export const configModule = ConfigModule.forRoot({
  envFilePath: envFilePath('apps/posts'),
  isGlobal: true,
});
