import { Module } from '@nestjs/common';
import { configModule } from './core/config/config-module';
import { CoreModule } from './core/config/core-config.module';
import { UsersModule } from './modules/users/users.module';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    configModule,
    CoreModule,
    UsersModule,
    AuthModule,
    InfrastructureModule,
    CqrsModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class UserAccountsModule {}
