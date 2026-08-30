import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenAuthGuard } from '../../../core/guards/bearer/access-token.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '@snaptix/common';
import {
  EditProfilePayload,
  EditProfileRequestDto,
  GeoLang,
  GetProfileSettingsResponseDto,
  MICROSERVICE_NAME,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiUnauthorizedCustomResponse } from '../../../core/swagger/unauthorized.swagger';
import { ApiBadRequestCustomResponse } from '../../../core/swagger/bad-request.swagger';
import { ApiConflictCustomResponse } from '../../../core/swagger/conflict.swagger';
import { ApiNotFoundCustomResponse } from '../../../core/swagger/not-found.swagger';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExtractLangFromCookie } from '../../../core/decorators/extract-lang-from-cookie.decorator';
import { ProfileSettingsAggregationService } from '../application/profile-settings-aggregation.service';

@Controller({ path: 'users/me/profile-settings', version: '1' })
@ApiBearerAuth()
export class ProfileSettingsController {
  constructor(
    @Inject(MICROSERVICE_NAME.USER_ACCOUNTS) private userAccounts: ClientProxy,
    private profileSettingsAggregationService: ProfileSettingsAggregationService,
  ) {}

  /**
   * Получение профиля юзера
   */
  @Get()
  @UseGuards(AccessTokenAuthGuard)
  @ApiOperation({
    description: `Возвращает настройки профиля текущего пользователя.
\n\`birthDate\` — в формате ISO 8601 \`YYYY-MM-DD\` (тот же формат, что принимает PUT).
\nНазвания страны, региона и города локализуются по cookie \`locale\` (значения: \`en\`, \`ru\`),
при отсутствии перевода используется \`en\`.
\n\`country\`, \`region\`, \`city\` равны \`null\`, если геолокация в профиле не заполнена.`,
  })
  @ApiUnauthorizedCustomResponse()
  @ApiNotFoundCustomResponse()
  @HttpCode(HttpStatus.OK)
  async getProfileSettings(
    @ExtractUserFromRequest() user: UserContextDto,
    @ExtractLangFromCookie() lang: GeoLang,
  ): Promise<GetProfileSettingsResponseDto> {
    return this.profileSettingsAggregationService.getProfileSettings({
      userId: user.userId,
      lang,
    });
  }

  /**
   * Редактирование профиля юзера
   */
  @Put()
  @UseGuards(AccessTokenAuthGuard)
  @ApiOperation({
    description: `Редактирование настроек профиля.
\n\`birthDate\` — в формате ISO 8601 \`YYYY-MM-DD\`, либо \`null\`.
\n\`countryId\`, \`regionId\`, \`cityId\` заполняются все три сразу либо все \`null\`.`,
  })
  @ApiUnauthorizedCustomResponse()
  @ApiBadRequestCustomResponse()
  @ApiConflictCustomResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async editProfile(
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: EditProfileRequestDto,
  ): Promise<void> {
    const result = this.userAccounts.send<void, EditProfilePayload>(
      USER_ACCOUNTS_PATTERNS.PROFILE.EDIT_PROFILE,
      {
        userId: user.userId,
        username: body.username,
        firstName: body.firstName,
        lastName: body.lastName,
        birthDate: body.birthDate,
        aboutMe: body.aboutMe,
        countryId: body.countryId,
        regionId: body.regionId,
        cityId: body.cityId,
      },
    );

    await firstValueFrom(result);
  }
}
