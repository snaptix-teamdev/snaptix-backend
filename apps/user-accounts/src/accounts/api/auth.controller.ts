import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CallbackGooglePayload,
  ForgotPasswordResponseDto,
  GetMePayload,
  GetMeResponseDto,
  RefreshTokensPayload,
  RegisterUserRequestDto,
  RegisterUserResponseDto,
  RegistrationConfirmationRequestDto,
  RegistrationConfirmationResponseDto,
  ResendEmailConfirmationCodePayload,
  ResetPasswordPayload,
  ResetPasswordResponseDto,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ForgotPasswordPayload } from '@snaptix/contracts/user-accounts/password-forgot/forgot-password.payload';
import { LoginPayload } from '@snaptix/contracts/user-accounts/login/login.payload';
import { AccessAndRefreshTokensDto } from '@snaptix/contracts/tokens';
import { RefreshTokenPayload } from '@snaptix/contracts/user-accounts/refresh-tokens/refresh-token.payload';
import { RegisterUserCommand } from '../application/commands/auth-commands/register-user.usecase';
import { ConfirmRegistrationCommand } from '../application/commands/auth-commands/confirm-registration.usecase';
import { GetMeQuery } from '../application/queries/get-me.query';
import { ForgotPasswordCommand } from '../application/commands/auth-commands/forgot-password.usecase';
import { ResetPasswordCommand } from '../application/commands/auth-commands/reset-password.usecase';
import { LoginUserCommand } from '../application/commands/auth-commands/login-user.usecase';
import { ResendEmailConfirmationCodeCommand } from '../application/commands/auth-commands/resend-email-confirmation-code.usecase';
import { RefreshTokensCommand } from '../application/commands/auth-commands/refresh-tokens.usecase';
import { LogoutUserCommand } from '../application/commands/auth-commands/logout-user.usecase';
import { AuthenticateWithGoogleCommand } from '../application/commands/auth-commands/authenticate-with-google.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @MessagePattern(USER_ACCOUNTS_PATTERNS.AUTH.REGISTER_USER)
  async register(
    @Payload() payload: RegisterUserRequestDto,
  ): Promise<RegisterUserResponseDto> {
    await this.commandBus.execute(new RegisterUserCommand(payload));

    return {};
  }

  @MessagePattern(USER_ACCOUNTS_PATTERNS.AUTH.REGISTRATION_CONFIRMATION)
  async registrationConfirmation(
    @Payload() payload: RegistrationConfirmationRequestDto,
  ): Promise<RegistrationConfirmationResponseDto> {
    await this.commandBus.execute(new ConfirmRegistrationCommand(payload));

    return {};
  }

  @MessagePattern(USER_ACCOUNTS_PATTERNS.AUTH.GET_ME)
  async getMe(@Payload() payload: GetMePayload): Promise<GetMeResponseDto> {
    return this.queryBus.execute(new GetMeQuery(payload));
  }

  @MessagePattern(USER_ACCOUNTS_PATTERNS.AUTH.FORGOT_PASSWORD)
  async forgotPassword(
    @Payload() payload: ForgotPasswordPayload,
  ): Promise<ForgotPasswordResponseDto> {
    await this.commandBus.execute(new ForgotPasswordCommand(payload));

    return {};
  }

  @MessagePattern(USER_ACCOUNTS_PATTERNS.AUTH.RESET_PASSWORD)
  async resetPassword(
    @Payload() payload: ResetPasswordPayload,
  ): Promise<ResetPasswordResponseDto> {
    await this.commandBus.execute(new ResetPasswordCommand(payload));

    return {};
  }

  @MessagePattern(USER_ACCOUNTS_PATTERNS.AUTH.LOGIN)
  async login(
    @Payload() payload: LoginPayload,
  ): Promise<AccessAndRefreshTokensDto> {
    return this.commandBus.execute(
      new LoginUserCommand({
        email: payload.email,
        password: payload.password,
        ip: payload.ip,
        userAgent: payload.userAgent,
      }),
    );
  }

  @MessagePattern(USER_ACCOUNTS_PATTERNS.AUTH.CALLBACK_GOOGLE)
  async callbackGoogle(
    @Payload() payload: CallbackGooglePayload,
  ): Promise<AccessAndRefreshTokensDto> {
    return this.commandBus.execute(new AuthenticateWithGoogleCommand(payload));
  }

  @MessagePattern(USER_ACCOUNTS_PATTERNS.AUTH.RESEND_EMAIL_CONFIRMATION_CODE)
  async resendEmailConfirmationCode(
    @Payload() payload: ResendEmailConfirmationCodePayload,
  ): Promise<object> {
    await this.commandBus.execute(
      new ResendEmailConfirmationCodeCommand(payload),
    );

    return {};
  }

  @MessagePattern(USER_ACCOUNTS_PATTERNS.AUTH.REFRESH_TOKENS)
  async refreshTokens(
    @Payload() payload: RefreshTokensPayload,
  ): Promise<AccessAndRefreshTokensDto> {
    return this.commandBus.execute(
      new RefreshTokensCommand({
        refreshToken: payload.refreshToken,
        ip: payload.ip,
      }),
    );
  }

  @MessagePattern(USER_ACCOUNTS_PATTERNS.AUTH.LOGOUT)
  async logout(@Payload() payload: RefreshTokenPayload): Promise<object> {
    await this.commandBus.execute(
      new LogoutUserCommand({
        refreshToken: payload.refreshToken,
      }),
    );
    return {};
  }
}
