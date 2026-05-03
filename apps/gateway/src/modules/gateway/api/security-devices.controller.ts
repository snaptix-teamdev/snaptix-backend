import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
} from '@nestjs/common';
import {
  MICROSERVICE_NAME,
  RefreshTokenPayload,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { ClientProxy } from '@nestjs/microservices';
import { RefreshTokenAuthGuard } from '../../../core/guards/cookie/refresh-token.guard';
import { ExtractRefreshTokenFromCookie } from '../../../core/decorators/extract-refresh-token-from-cookie.decorator';
import { firstValueFrom } from 'rxjs';
import { ApiUnauthorizedCustomResponse } from '../../../core/swagger/unauthorized.swagger';

@Controller({ path: 'security/devices', version: '1' })
@UseGuards(RefreshTokenAuthGuard)
export class SecurityDevicesController {
  constructor(
    @Inject(MICROSERVICE_NAME.USER_ACCOUNTS) private userAccounts: ClientProxy,
  ) {}

  /**
   * Деактивация всех сессий, кроме текущей
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUnauthorizedCustomResponse()
  async deactivateAllExcludingCurrent(
    @ExtractRefreshTokenFromCookie() refreshToken: string,
  ): Promise<void> {
    const result = this.userAccounts.send<void, RefreshTokenPayload>(
      USER_ACCOUNTS_PATTERNS.SECURITY_DEVICES.DEACTIVATE_ALL_EXCLUDING_CURRENT,
      { refreshToken },
    );

    await firstValueFrom(result);
  }
}
