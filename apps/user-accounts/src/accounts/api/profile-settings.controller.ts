import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  EditProfilePayload,
  GetProfileSettingsMsResponseDto,
  GetProfileSettingsPayload,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EditProfileCommand } from '../application/commands/profile-commands/edit-profile.usecase';
import { GetProfileSettingsQuery } from '../application/queries/get-profile-settings.query';

@Controller({ path: 'users/me/profile-settings' })
export class ProfileSettingsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @MessagePattern(USER_ACCOUNTS_PATTERNS.PROFILE.GET_PROFILE_SETTINGS)
  async getProfileSettings(
    @Payload() payload: GetProfileSettingsPayload,
  ): Promise<GetProfileSettingsMsResponseDto> {
    return this.queryBus.execute(
      new GetProfileSettingsQuery({ userId: payload.userId }),
    );
  }

  @MessagePattern(USER_ACCOUNTS_PATTERNS.PROFILE.EDIT_PROFILE)
  async editProfile(@Payload() payload: EditProfilePayload): Promise<object> {
    await this.commandBus.execute(
      new EditProfileCommand({
        userId: payload.userId,
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        birthDate: payload.birthDate,
        aboutMe: payload.aboutMe,
        countryId: payload.countryId,
        regionId: payload.regionId,
        cityId: payload.cityId,
      }),
    );

    return {};
  }
}
