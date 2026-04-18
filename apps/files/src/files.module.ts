import { configModule } from './core/config/config-module';
import { CoreModule } from './core/core.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [configModule, CoreModule],
  controllers: [],
  providers: [],
})
export class FilesModule {}
