import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RecaptchaGuard } from '../guards/recaptcha.guard';
import { PassRecoveryInputDto } from './input-dto/pass-recovery.input-dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  RegisterUserRequestDto,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/commands/register-user.usecase';

@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  //TODO: Перенести RecaptchaGuard и его логику вместе с env в gateway
  @Post('password-recovery')
  @UseGuards(RecaptchaGuard)
  passwordRecovery(@Body() body: PassRecoveryInputDto): string {
    return 'email sent to your email ' + body.email;
  }

  @MessagePattern(USER_ACCOUNTS_PATTERNS.AUTH.REGISTER_USER)
  register(@Payload() payload: RegisterUserRequestDto) {
    return this.commandBus.execute(new RegisterUserCommand(payload));
  }
}
