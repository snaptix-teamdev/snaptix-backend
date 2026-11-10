import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenAuthGuard } from '../../../core/guards/bearer/access-token.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import { FileEntityType, UserContextDto } from '@snaptix/common';
import {
  AddAvatarRequestDto,
  AddAvatarResponseDto,
  ConfirmUploadFilePayload,
  DeleteUserAvatarMsResponseDto,
  DeleteUserAvatarPayload,
  EditProfilePayload,
  EditProfileRequestDto,
  FILES_MICROSERVICE_PATTERNS,
  GeoLang,
  GetProfileSettingsResponseDto,
  GetUploadAvatarUrlRequestDto,
  GetUploadUrlPayload,
  GetUploadUrlResponseDto,
  MICROSERVICE_NAME,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiUnauthorizedCustomResponse } from '../../../core/swagger/unauthorized.swagger';
import { ApiBadRequestCustomResponse } from '../../../core/swagger/bad-request.swagger';
import { ApiConflictCustomResponse } from '../../../core/swagger/conflict.swagger';
import { ApiNotFoundCustomResponse } from '../../../core/swagger/not-found.swagger';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ExtractLangFromCookie } from '../../../core/decorators/extract-lang-from-cookie.decorator';
import { ProfileSettingsAggregationService } from '../application/profile-settings-aggregation.service';
import { UUIDValidationOrBadRequestPipe } from '../../../core/pipes/uuid-validation.pipe';

@Controller({ path: 'users/me/profile-settings', version: '1' })
@ApiBearerAuth()
@UseGuards(AccessTokenAuthGuard)
export class ProfileSettingsController {
  constructor(
    @Inject(MICROSERVICE_NAME.USER_ACCOUNTS) private userAccounts: ClientProxy,
    @Inject(MICROSERVICE_NAME.FILES) private files: ClientProxy,
    private profileSettingsAggregationService: ProfileSettingsAggregationService,
  ) {}

  /**
   * Получение профиля юзера
   */
  @Get()
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
   * Установить аватар профиля
   */
  @Post('add-avatar')
  @ApiOperation({ description: '' })
  @ApiOkResponse({ type: AddAvatarResponseDto })
  async addAvatar(
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: AddAvatarRequestDto,
  ): Promise<AddAvatarResponseDto> {
    return this.profileSettingsAggregationService.addAvatar({
      userId: user.userId,
      fileId: body.fileId,
    });
  }

  /**
   * Получить presignedUrl для загрузки аватара юзера
   */
  @Post('avatar/get-upload-url')
  @ApiOperation({
    description: `
Шаги загрузки аватара:
\n1. Извлечь необходимые данные из файла и получить \`url\` и \`fileId\`
\n2. Загрузить файл отправив \`PUT\` запрос на \`url\``,
  })
  @ApiBadRequestCustomResponse()
  @ApiUnauthorizedCustomResponse()
  getUploadAvatarUrl(
    @Body() body: GetUploadAvatarUrlRequestDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GetUploadUrlResponseDto> {
    const result = this.files.send<
      GetUploadUrlResponseDto,
      GetUploadUrlPayload
    >(FILES_MICROSERVICE_PATTERNS.FILES.GET_UPLOAD_URL, {
      userId: user.userId,
      fileName: body.fileName,
      contentLengthBytes: body.contentLengthBytes,
      mimeType: body.mimeType,
      fileEntityType: FileEntityType.USER_AVATAR,
    });

    return firstValueFrom(result);
  }

  /**
   * Подтвердить загрузку аватара юзера
   */
  @Post('avatar/:fileId/confirm')
  @ApiNotFoundCustomResponse()
  @ApiBadRequestCustomResponse()
  @ApiUnauthorizedCustomResponse()
  @ApiConflictCustomResponse()
  async confirmUploadAvatar(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('fileId', UUIDValidationOrBadRequestPipe) fileId: string,
  ): Promise<void> {
    const result = this.files.send<void, ConfirmUploadFilePayload>(
      FILES_MICROSERVICE_PATTERNS.FILES.CONFIRM_UPLOAD_FILE,
      {
        userId: user.userId,
        fileId,
      },
    );

    await firstValueFrom(result);
  }
  /**
   * Редактирование профиля юзера
   */
  @Put()
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

  @Delete('avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUnauthorizedCustomResponse()
  @ApiNotFoundCustomResponse()
  async deleteAvatar(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    const result = this.userAccounts.send<
      DeleteUserAvatarMsResponseDto,
      DeleteUserAvatarPayload
    >(USER_ACCOUNTS_PATTERNS.PROFILE.DELETE_AVATAR, { userId: user.userId });

    await firstValueFrom(result);
  }
}
