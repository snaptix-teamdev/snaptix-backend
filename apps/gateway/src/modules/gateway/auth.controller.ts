import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
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
  ResendEmailConfirmationCodePayload,
  ResendEmailConfirmationCodeRequestDto,
  ResetPasswordPayload,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { ApiBadRequestCustomResponse } from '../../core/swagger/bad-request.swagger';
import { ApiConflictCustomResponse } from '../../core/swagger/conflict.swagger';
import { ApiNotFoundCustomResponse } from '../../core/swagger/not-found.swagger';
import { ApiTooManyRequestsCustomResponse } from '../../core/swagger/too-many-requests.swagger';
import { AccessTokenAuthGuard } from '../../core/guards/bearer/access-token.guard';
import { ExtractUserFromRequest } from '../../core/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '@snaptix/common/dto/user-context.dto';
import { ApiUnauthorizedCustomResponse } from '../../core/swagger/unauthorized.swagger';
import { ForgotPasswordPayload } from '@snaptix/contracts/user-accounts/password-forgot/forgot-password.payload';
import { ApiForbiddenCustomResponse } from '../../core/swagger/forbidden.swagger';
import { RecaptchaGuard } from '../../core/guards/recaptcha/recaptcha.guard';
import { LoginRequestDto } from '@snaptix/contracts/user-accounts/login/login.request-dto';
import { LoginResponseDto } from '@snaptix/contracts/user-accounts/login/login.response-dto';
import { ExtractClientDetails } from '../../core/decorators/extract-client-details.decorator';
import { ClientDetailsRequestDto } from '@snaptix/contracts/user-accounts/login/client-details.request-dto';
import { Response } from 'express';
import { AccessAndRefreshTokensDto } from '@snaptix/contracts/tokens';
import { LoginPayload } from '@snaptix/contracts/user-accounts/login/login.payload';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

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
  async registrationConfirmation(
    @Body() payload: RegistrationConfirmationRequestDto,
  ): Promise<void> {
    const result = this.userAccounts.send(
      USER_ACCOUNTS_PATTERNS.AUTH.REGISTRATION_CONFIRMATION,
      payload,
    );

    await firstValueFrom(result);
  }

  /**
   * Отправить код подтверждения email еще раз
   */
  @Post('resend-email-confirmation-code')
  @ApiBadRequestCustomResponse()
  @ApiTooManyRequestsCustomResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendEmailConfirmationCode(
    @Body() body: ResendEmailConfirmationCodeRequestDto,
  ): Promise<void> {
    const result = this.userAccounts.send<
      void,
      ResendEmailConfirmationCodePayload
    >(USER_ACCOUNTS_PATTERNS.AUTH.RESEND_EMAIL_CONFIRMATION_CODE, {
      email: body.email,
    });

    await firstValueFrom(result);
  }

  /**
   * Запросить код сброса пароля на почту
   */
  @Post('password/forgot')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RecaptchaGuard)
  @ApiOperation({
    description:
      'Требует reCAPTCHA v3: передайте токен в поле `recaptchaToken` тела запроса.',
  })
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

  /**
   * Сбросить пароль по коду
   */
  @Post('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBadRequestCustomResponse()
  @ApiNotFoundCustomResponse()
  @ApiConflictCustomResponse()
  @ApiTooManyRequestsCustomResponse()
  async resetPassword(@Body() body: ResetPasswordRequestDto): Promise<void> {
    const result = this.userAccounts.send<
      ResetPasswordResponseDto,
      ResetPasswordPayload
    >(USER_ACCOUNTS_PATTERNS.AUTH.RESET_PASSWORD, {
      code: body.code,
      password: body.password,
    });

    await firstValueFrom(result);
  }

  /**
   * Вход в систему
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Успешный логин. `refreshToken` записывается в `cookie`',
    type: LoginResponseDto,
  })
  @ApiBadRequestCustomResponse()
  @ApiUnauthorizedCustomResponse()
  @ApiForbiddenCustomResponse()
  async login(
    @Body() body: LoginRequestDto,
    @ExtractClientDetails() clientDetails: ClientDetailsRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const result = this.userAccounts.send<
      AccessAndRefreshTokensDto,
      LoginPayload
    >(USER_ACCOUNTS_PATTERNS.AUTH.LOGIN, {
      email: body.email,
      password: body.password,
      ip: clientDetails.ip,
      userAgent: clientDetails.userAgent,
    });

    const tokens = await firstValueFrom(result);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken: tokens.accessToken };
  }

  /**
   * Получение информации о текущем юзере
   */
  @Get('me')
  @UseGuards(AccessTokenAuthGuard)
  @ApiBearerAuth()
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
}
