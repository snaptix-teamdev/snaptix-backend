import { Controller, Get } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../../auth/application/commands/register-user.usecase';
import { DomainException } from '@snaptix/common';
import { ERRORS } from '@snaptix/contracts';
import { MessagePattern, Transport } from '@nestjs/microservices';

@Controller()
export class UserController {
  constructor(private commandBus: CommandBus) {}

  @Get()
  async createUser() {
    // try {
    throw new DomainException(ERRORS.USER_EMAIL_ALREADY_EXISTS);
    const result = await this.commandBus.execute(
      new RegisterUserCommand({
        email: 'test@email.com',
        username: 'test',
        password: 'test',
      }),
    );
    //
    // if (!result.isOk) {
    //   return {
    //     code: result.code,
    //     message: result.message,
    //   };
    // }

    return result;
    // } catch (error) {
    //   // if (error instanceof DomainException) {
    //   //   console.log('DOMAIN!');
    //   //   console.log(error.code);
    //   //   console.log(error.httpCode);
    //   //   return error
    //   // }
    //   // console.log(error);
    //   return error;
    // }
  }

  @MessagePattern({ cmd: 'sum' }, Transport.TCP)
  createUserCommand() {
    console.log('USER CREATE');
    // try {
    throw new DomainException(ERRORS.USER_EMAIL_ALREADY_EXISTS);
    // const result = await this.commandBus.execute(
    //   new RegisterUserCommand({
    //     email: 'test@email.com',
    //     username: 'test',
    //     password: 'test',
    //   }),
    // );
    //
    // if (!result.isOk) {
    //   return {
    //     code: result.code,
    //     message: result.message,
    //   };
    // }

    return 'result';
    // } catch (error) {
    //   // if (error instanceof DomainException) {
    //   //   console.log('DOMAIN!');
    //   //   console.log(error.code);
    //   //   console.log(error.httpCode);
    //   //   return error
    //   // }
    //   // console.log(error);
    //   return error;
    // }
  }
}
