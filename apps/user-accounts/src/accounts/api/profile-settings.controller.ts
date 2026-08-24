import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EditProfilePayload, USER_ACCOUNTS_PATTERNS } from '@snaptix/contracts';
import { CommandBus } from '@nestjs/cqrs';
import { EditProfileCommand } from '../application/commands/profile-commands/edit-profile.usecase';

@Controller({ path: 'users/me/profile-settings' })
export class ProfileSettingsController {
  constructor(private commandBus: CommandBus) {}

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
