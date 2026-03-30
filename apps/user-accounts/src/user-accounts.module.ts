import { Module } from '@nestjs/common';
import { configModule } from './core/config/dynamic-config-module';
import { CoreModule } from './core/config/core-config.module';
import { AuthController } from './auth/api/auth.controller';
import { RecaptchaGuard } from './auth/guards/recaptcha.guard';
import { UsersModule } from './modules/users/users.module';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [
    configModule,
    CoreModule,
    UsersModule,
    InfrastructureModule,
    CqrsModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [RecaptchaGuard],
})
export class UserAccountsModule {}
