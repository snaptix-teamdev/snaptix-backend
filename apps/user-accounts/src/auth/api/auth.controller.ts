import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RecaptchaGuard } from '../guards/recaptcha.guard';
import { PassRecoveryInputDto } from './input-dto/pass-recovery.input-dto';

@Controller('auth')
export class AuthController {
  constructor() {}

  @Post('password-recovery')
  @UseGuards(RecaptchaGuard)
  passwordRecovery(@Body() body: PassRecoveryInputDto): string {
    return 'email sent to your email ' + body.email;
  }
}
