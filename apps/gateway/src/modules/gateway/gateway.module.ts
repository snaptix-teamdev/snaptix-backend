import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { PostsController } from './api/posts.controller';
import { UsersController } from './api/users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAME } from '@snaptix/contracts';
import { CoreConfig } from '../../core/config/core.config';
import { SecurityDevicesController } from './api/security-devices.controller';
import { GatewayConfig } from './gateway.config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_NAME.USER_ACCOUNTS,
        inject: [CoreConfig],
        useFactory: (coreConfig: CoreConfig) => ({
          transport: Transport.TCP,
          options: {
            host: coreConfig.microserviceUserAccountsHost,
            port: coreConfig.microserviceUserAccountsPort,
          },
        }),
      },
      {
        name: MICROSERVICE_NAME.FILES,
        inject: [CoreConfig],
        useFactory: (coreConfig: CoreConfig) => ({
          transport: Transport.TCP,
          options: {
            host: coreConfig.microserviceFilesHost,
            port: coreConfig.microserviceFilesPort,
          },
        }),
      },
      {
        name: MICROSERVICE_NAME.POSTS,
        inject: [CoreConfig],
        useFactory: (coreConfig: CoreConfig) => ({
          transport: Transport.TCP,
          options: {
            host: coreConfig.microservicePostsHost,
            port: coreConfig.microservicePostsPort,
          },
        }),
      },
    ]),
  ],
  controllers: [
    AuthController,
    SecurityDevicesController,
    PostsController,
    UsersController,
  ],
  providers: [GatewayConfig],
})
export class GatewayModule {}
