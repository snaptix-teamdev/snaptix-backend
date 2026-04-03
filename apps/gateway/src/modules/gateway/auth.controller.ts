import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  MICROSERVICE_NAME,
  RegisterUserRequestDto,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(MICROSERVICE_NAME.USER_ACCOUNTS) private userAccounts: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() payload: RegisterUserRequestDto) {
    return this.userAccounts.send(
      USER_ACCOUNTS_PATTERNS.AUTH.REGISTER_USER,
      payload,
    );
  }
}
