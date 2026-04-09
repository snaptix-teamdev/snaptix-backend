import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './config/core.config';
import { AccessTokenStrategy } from './guards/bearer/access-token.strategy';
import { PassportModule } from '@nestjs/passport';
import { RecaptchaGuard } from './guards/recaptcha/recaptcha.guard';

@Global()
@Module({
  imports: [PassportModule],
  providers: [CoreConfig, AccessTokenStrategy, RecaptchaGuard],
  exports: [CoreConfig, RecaptchaGuard],
})
export class CoreModule {}
