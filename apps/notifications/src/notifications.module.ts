import { Module } from '@nestjs/common';
import { configModule } from './core/config/config-module';
import { CoreModule } from './core/core.module';
import { UsersModule } from './modules/users/users.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [configModule, CoreModule, InfrastructureModule, UsersModule],
})
export class NotificationsModule {}
