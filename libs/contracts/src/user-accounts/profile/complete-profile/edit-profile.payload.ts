import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ProfileSchemas } from '@snaptix/contracts/schemas/profile.schemas';
import { CommonSchemas } from '@snaptix/contracts/schemas';
import { UserAccountsSchemas } from '@snaptix/contracts/schemas/user-accounts.schemas';

const editProfileSchema = z.object({
  userId: CommonSchemas.uuid,
  username: UserAccountsSchemas.username,
  firstName: ProfileSchemas.firstName,
  lastName: ProfileSchemas.lastName,
  birthDate: ProfileSchemas.birthDate,
  aboutMe: ProfileSchemas.aboutMe,
  countryId: ProfileSchemas.countryId,
  regionId: ProfileSchemas.regionId,
  cityId: ProfileSchemas.cityId,
});

export class EditProfilePayload extends createZodDto(editProfileSchema) {}
