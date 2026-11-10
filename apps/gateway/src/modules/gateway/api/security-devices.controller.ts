import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  DeactivateSessionByIdMsResponseDto,
  DeactivateSessionByIdPayload,
  GetActiveDevicesResponseDto,
  MICROSERVICE_NAME,
  RefreshTokenPayload,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { ClientProxy } from '@nestjs/microservices';
import { RefreshTokenAuthGuard } from '../../../core/guards/cookie/refresh-token.guard';
import { ExtractRefreshTokenFromCookie } from '../../../core/decorators/extract-refresh-token-from-cookie.decorator';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { ApiUnauthorizedCustomResponse } from '../../../core/swagger/unauthorized.swagger';
import { ApiBadRequestCustomResponse } from '../../../core/swagger/bad-request.swagger';
import { ApiNotFoundCustomResponse } from '../../../core/swagger/not-found.swagger';
import { UUIDValidationOrBadRequestPipe } from '../../../core/pipes/uuid-validation.pipe';

@Controller({ path: 'security/devices', version: '1' })
@ApiCookieAuth()
@UseGuards(RefreshTokenAuthGuard)
export class SecurityDevicesController {
  constructor(
    @Inject(MICROSERVICE_NAME.USER_ACCOUNTS) private userAccounts: ClientProxy,
  ) {}

  /**
   * Получение списка девайсов
   */
  @Get()
  @ApiUnauthorizedCustomResponse()
  async getActiveDevices(
    @ExtractRefreshTokenFromCookie() refreshToken: string,
  ): Promise<GetActiveDevicesResponseDto[]> {
    const result = this.userAccounts.send<
      GetActiveDevicesResponseDto[],
      RefreshTokenPayload
    >(USER_ACCOUNTS_PATTERNS.SECURITY_DEVICES.GET_ACTIVE_DEVICES, {
      refreshToken,
    });

    return firstValueFrom(result);
  }

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

  /**
   * Деактивация сессии по deviceId
   */
  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      '`deviceId` берётся из `GET /security/devices`. При деактивации текущей сессии cookie `refreshToken` очищается',
  })
  @ApiBadRequestCustomResponse()
  @ApiUnauthorizedCustomResponse()
  @ApiNotFoundCustomResponse()
  async deactivateSessionById(
    @Param('deviceId', UUIDValidationOrBadRequestPipe) deviceId: string,
    @ExtractRefreshTokenFromCookie() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const result = this.userAccounts.send<
      DeactivateSessionByIdMsResponseDto,
      DeactivateSessionByIdPayload
    >(USER_ACCOUNTS_PATTERNS.SECURITY_DEVICES.DEACTIVATE_SESSION_BY_ID, {
      refreshToken,
      deviceId,
    });

    const { isCurrentSession } = await firstValueFrom(result);

    if (isCurrentSession) {
      res.clearCookie('refreshToken', { httpOnly: true, secure: true });
    }
  }
}
