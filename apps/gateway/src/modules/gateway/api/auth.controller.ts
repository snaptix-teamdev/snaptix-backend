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
  ClientDetailsRequestDto,
  ForgotPasswordPayload,
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  GetMePayload,
  GetMeResponseDto,
  CallbackGooglePayload,
  LoginPayload,
  LoginRequestDto,
  LoginResponseDto,
  MICROSERVICE_NAME,
  RefreshTokenPayload,
  RefreshTokensPayload,
  RefreshTokensResponseDto,
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
import { ApiBadRequestCustomResponse } from '../../../core/swagger/bad-request.swagger';
import { ApiConflictCustomResponse } from '../../../core/swagger/conflict.swagger';
import { ApiNotFoundCustomResponse } from '../../../core/swagger/not-found.swagger';
import { ApiTooManyRequestsCustomResponse } from '../../../core/swagger/too-many-requests.swagger';
import { AccessTokenAuthGuard } from '../../../core/guards/bearer/access-token.guard';
import { RefreshTokenAuthGuard } from '../../../core/guards/cookie/refresh-token.guard';
import {
  ExtractOAuthUserFromRequest,
  ExtractUserFromRequest,
} from '../../../core/decorators/extract-user-from-request.decorator';
import {
  UserContextDto,
  UserOAuthContextDto,
} from '@snaptix/common/dto/user-context.dto';
import { ApiUnauthorizedCustomResponse } from '../../../core/swagger/unauthorized.swagger';
import { ApiForbiddenCustomResponse } from '../../../core/swagger/forbidden.swagger';
import { RecaptchaGuard } from '../../../core/guards/recaptcha/recaptcha.guard';
import { ExtractClientDetails } from '../../../core/decorators/extract-client-details.decorator';
import { Response } from 'express';
import { AccessAndRefreshTokensDto } from '@snaptix/contracts/tokens';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ExtractRefreshTokenFromCookie } from '../../../core/decorators/extract-refresh-token-from-cookie.decorator';
import { GoogleAuthGuard } from '../../../core/guards/google-oauth/google-auth.guard';

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

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  loginGoogle() {
    return { msg: 'Google Authentication' };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async callbackGoogle(
    @ExtractOAuthUserFromRequest() user: UserOAuthContextDto,
    @ExtractClientDetails() clientDetails: ClientDetailsRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = this.userAccounts.send<
      AccessAndRefreshTokensDto,
      CallbackGooglePayload
    >(USER_ACCOUNTS_PATTERNS.AUTH.CALLBACK_GOOGLE, {
      email: user.email,
      externalProviderId: user.externalProviderId,
      provider: user.provider,
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
   * Обновление пары токенов
   */
  @Post('refresh-tokens')
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description:
      'Успешное обновление токенов. `refreshToken` записывается в `cookie`',
    type: RefreshTokensResponseDto,
  })
  @ApiCookieAuth()
  @ApiUnauthorizedCustomResponse()
  async refreshTokens(
    @ExtractRefreshTokenFromCookie() refreshToken: string,
    @ExtractClientDetails() clientDetails: ClientDetailsRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshTokensResponseDto> {
    const result = this.userAccounts.send<
      AccessAndRefreshTokensDto,
      RefreshTokensPayload
    >(USER_ACCOUNTS_PATTERNS.AUTH.REFRESH_TOKENS, {
      refreshToken,
      ip: clientDetails.ip,
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

  /**
   * Выход из системы
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenAuthGuard)
  async logout(
    @ExtractRefreshTokenFromCookie() refreshToken: string,
  ): Promise<void> {
    const result = this.userAccounts.send<void, RefreshTokenPayload>(
      USER_ACCOUNTS_PATTERNS.AUTH.LOGOUT,
      { refreshToken },
    );

    await firstValueFrom(result);
  }
}
