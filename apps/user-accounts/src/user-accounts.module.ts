import { Module } from '@nestjs/common';
import { configModule } from './core/config/dynamic-config-module';
import { CoreModule } from './core/config/core-config.module';
import { AuthController } from './auth/api/auth.controller';
import { RecaptchaGuard } from './auth/guards/recaptcha.guard';

@Module({
  imports: [configModule, CoreModule],
  controllers: [AuthController],
  providers: [RecaptchaGuard],
})
export class UserAccountsModule {}
