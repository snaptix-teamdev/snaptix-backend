import { ConfigModule } from '@nestjs/config';
import { envFilePath } from '@snaptix/common';
import { MICROSERVICE_NAME } from '@snaptix/contracts';

export const configModule = ConfigModule.forRoot({
  envFilePath: envFilePath(`apps/${MICROSERVICE_NAME.GEO}`),
  isGlobal: true,
});
