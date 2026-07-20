import { configModule } from './core/config/config-module';
import { CoreModule } from './core/core.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { GeoModule } from './modules/geo/geo.module';

@Module({
  imports: [
    configModule,
    CoreModule,
    InfrastructureModule,
    CqrsModule.forRoot(),
    GeoModule,
  ],
})
export class AppModule {}
