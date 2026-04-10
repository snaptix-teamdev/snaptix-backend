import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  GetMePayload,
  GetMeResponseDto,
  MICROSERVICE_NAME,
  RegisterUserRequestDto,
  RegisterUserResponseDto,
  RegistrationConfirmationRequestDto,
  RegistrationConfirmationResponseDto,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { ApiBadRequestCustomResponse } from '../../core/swagger/bad-request.swagger';
import { ApiConflictCustomResponse } from '../../core/swagger/conflict.swagger';
import { ApiNotFoundCustomResponse } from '../../core/swagger/not-found.swagger';
import { ApiTooManyRequestsCustomResponse } from '../../core/swagger/too-many-requests.swagger';
import { AccessTokenAuthGuard } from '../../core/guards/bearer/access-token.guard';
import { ExtractUserFromRequest } from '../../core/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '../../core/dto/user-context.dto';
import { ApiUnauthorizedCustomResponse } from '../../core/swagger/unauthorized.swagger';
import { ForgotPasswordPayload } from '@snaptix/contracts/user-accounts/password-forgot/forgot-password.payload';
import { ApiForbiddenCustomResponse } from '../../core/swagger/forbidden.swagger';
import { RecaptchaGuard } from '../../core/guards/recaptcha/recaptcha.guard';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    @Inject(MICROSERVICE_NAME.USER_ACCOUNTS) private userAccounts: ClientProxy,
  ) {}

  /**
   * Регистрация юзера
   */
  @Post('register')
  @ApiBadRequestCustomResponse()
  @ApiConflictCustomResponse()
  @ApiTooManyRequestsCustomResponse()
  register(
    @Body() payload: RegisterUserRequestDto,
  ): Promise<RegisterUserResponseDto> {
    const result = this.userAccounts.send(
      USER_ACCOUNTS_PATTERNS.AUTH.REGISTER_USER,
      payload,
    );

    return firstValueFrom(result);
  }

  /**
   * Подтверждение почты юзера
   */
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBadRequestCustomResponse()
  @ApiNotFoundCustomResponse()
  @ApiConflictCustomResponse()
  @ApiTooManyRequestsCustomResponse()
  registrationConfirmation(
    @Body() payload: RegistrationConfirmationRequestDto,
  ): Promise<RegistrationConfirmationResponseDto> {
    const result = this.userAccounts.send(
      USER_ACCOUNTS_PATTERNS.AUTH.REGISTRATION_CONFIRMATION,
      payload,
    );

    return firstValueFrom(result);
  }

  /**
   * Получение информации о текущем юзере
   */
  @Get('me')
  @UseGuards(AccessTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedCustomResponse()
  @ApiNotFoundCustomResponse()
  @ApiTooManyRequestsCustomResponse()
  async getMe(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GetMeResponseDto> {
    const result = this.userAccounts.send<GetMeResponseDto, GetMePayload>(
      USER_ACCOUNTS_PATTERNS.AUTH.GET_ME,
      { id: user.userId },
    );

    return firstValueFrom(result);
  }

  /**
   * Запросить код сброса пароля на почту
   */
  @Post('password/forgot')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RecaptchaGuard)
  @ApiForbiddenCustomResponse()
  @ApiBadRequestCustomResponse()
  @ApiTooManyRequestsCustomResponse()
  async forgotPassword(@Body() body: ForgotPasswordRequestDto): Promise<void> {
    const result = this.userAccounts.send<
      ForgotPasswordResponseDto,
      ForgotPasswordPayload
    >(USER_ACCOUNTS_PATTERNS.AUTH.FORGOT_PASSWORD, {
      email: body.email,
    });

    await firstValueFrom(result);
  }
}
