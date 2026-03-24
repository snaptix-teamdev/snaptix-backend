import { Module } from '@nestjs/common';
import { configModule } from './core/config/dynamic-config-module';
import { CoreModule } from './core/config/core-config.module';

@Module({
  imports: [configModule, CoreModule],
  controllers: [],
  providers: [],
})
export class UserAccountsModule {}
