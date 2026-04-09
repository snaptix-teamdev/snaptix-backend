import { Module } from '@nestjs/common';
import { configModule } from './core/config/config-module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [configModule, CoreModule],
})
export class NotificationsModule {}
