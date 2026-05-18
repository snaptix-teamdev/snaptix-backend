import { configModule } from './core/config/config-module';
import { CoreModule } from './core/core.module';
import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { CqrsModule } from '@nestjs/cqrs';
import { FilesFeatureModule } from './modules/files/files.module';

@Module({
  imports: [
    configModule,
    CoreModule,
    InfrastructureModule,
    CqrsModule.forRoot(),
    FilesFeatureModule,
  ],
  controllers: [],
  providers: [],
})
export class FilesModule {}
