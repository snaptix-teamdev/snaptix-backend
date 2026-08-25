import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ProfileSchemas } from '@snaptix/contracts/schemas/profile.schemas';
import { UserAccountsSchemas } from '@snaptix/contracts/schemas/user-accounts.schemas';

const editProfileSchema = z.object({
  username: UserAccountsSchemas.username,
  firstName: ProfileSchemas.firstName,
  lastName: ProfileSchemas.lastName,
  birthDate: ProfileSchemas.birthDate,
  aboutMe: ProfileSchemas.aboutMe,
  countryId: ProfileSchemas.countryId,
  regionId: ProfileSchemas.regionId,
  cityId: ProfileSchemas.cityId,
});

export class EditProfileRequestDto extends createZodDto(editProfileSchema) {}
