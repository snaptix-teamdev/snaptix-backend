import {
  Body,
  Controller,
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
  MICROSERVICE_NAME,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiUnauthorizedCustomResponse } from '../../../core/swagger/unauthorized.swagger';
import { ApiBadRequestCustomResponse } from '../../../core/swagger/bad-request.swagger';
import { ApiConflictCustomResponse } from '../../../core/swagger/conflict.swagger';

@Controller({ path: 'users/me/profile-settings', version: '1' })
export class ProfileSettingsController {
  constructor(
    @Inject(MICROSERVICE_NAME.USER_ACCOUNTS) private userAccounts: ClientProxy,
  ) {}
  /**
   * Редактирование профиля юзера
   */
  @Put()
  @UseGuards(AccessTokenAuthGuard)
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
