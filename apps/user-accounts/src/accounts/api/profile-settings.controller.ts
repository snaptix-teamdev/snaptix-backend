import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CompleteProfilePayload,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { CommandBus } from '@nestjs/cqrs';
import { CompleteProfileCommand } from '../application/commands/profile-commands/complete-profile.usecase';

@Controller({ path: 'users/me/profile-settings' })
export class ProfileSettingsController {
  constructor(private commandBus: CommandBus) {}

  @MessagePattern(USER_ACCOUNTS_PATTERNS.PROFILE.COMPLETE_PROFILE)
  async completeProfile(
    @Payload() payload: CompleteProfilePayload,
  ): Promise<object> {
    await this.commandBus.execute(
      new CompleteProfileCommand({
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
