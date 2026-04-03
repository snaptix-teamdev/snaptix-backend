import { Module } from '@nestjs/common';
import { GatewayModule } from './modules/gateway/gateway.module';
import { configModule } from './core/config/config-module';
import { CoreModule } from './core/config/core-config.module';

@Module({
  imports: [configModule, CoreModule, GatewayModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
