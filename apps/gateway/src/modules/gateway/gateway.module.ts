import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { PostsController } from './api/posts.controller';
import { UsersController } from './api/users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAME } from '@snaptix/contracts';
import { CoreConfig } from '../../core/config/core.config';
import { SecurityDevicesController } from './api/security-devices.controller';
import { GatewayConfig } from './gateway.config';
import { HomeController } from './api/home.controller';
import { HomeService } from './application/home.service';
import { GeoController } from './api/geo.controller';
import { PostAggregationService } from './application/post-aggregation.service';
import { GoogleStrategy } from '../../core/guards/google-oauth/google.strategy';
import { GoogleAuthGuard } from '../../core/guards/google-oauth/google-auth.guard';
import { ProfileSettingsController } from './api/profile-settings.controller';
import { ProfileSettingsAggregationService } from './application/profile-settings-aggregation.service';

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
      {
        name: MICROSERVICE_NAME.GEO,
        inject: [CoreConfig],
        useFactory: (coreConfig: CoreConfig) => ({
          transport: Transport.TCP,
          options: {
            host: coreConfig.microserviceGeoHost,
            port: coreConfig.microserviceGeoPort,
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
    HomeController,
    GeoController,
    ProfileSettingsController,
  ],
  providers: [
    GatewayConfig,
    HomeService,
    PostAggregationService,
    ProfileSettingsAggregationService,
    GoogleStrategy,
    GoogleAuthGuard,
  ],
  exports: [GatewayConfig],
})
export class GatewayModule {}
