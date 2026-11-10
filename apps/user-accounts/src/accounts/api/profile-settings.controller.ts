import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AddAvatarMsResponseDto,
  AddAvatarPayload,
  DeleteUserAvatarMsResponseDto,
  DeleteUserAvatarPayload,
  EditProfilePayload,
  GetProfileSettingsMsResponseDto,
  GetProfileSettingsPayload,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EditProfileCommand } from '../application/commands/profile-commands/edit-profile.usecase';
import { GetProfileSettingsQuery } from '../application/queries/get-profile-settings.query';
import { AddAvatarCommand } from '../application/commands/profile-commands/add-avatar.usecase';
import { DeleteUserAvatarCommand } from '../application/commands/profile-commands/delete-user-avatar.use-case';

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

  @MessagePattern(USER_ACCOUNTS_PATTERNS.PROFILE.ADD_AVATAR)
  async addAvatar(
    @Payload() payload: AddAvatarPayload,
  ): Promise<AddAvatarMsResponseDto> {
    return this.commandBus.execute(
      new AddAvatarCommand({
        userId: payload.userId,
        fileId: payload.fileId,
      }),
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

  @MessagePattern(USER_ACCOUNTS_PATTERNS.PROFILE.DELETE_AVATAR)
  async deleteAvatar(
    @Payload() payload: DeleteUserAvatarPayload,
  ): Promise<DeleteUserAvatarMsResponseDto> {
    await this.commandBus.execute(
      new DeleteUserAvatarCommand({
        userId: payload.userId,
      }),
    );

    return {};
  }
}
