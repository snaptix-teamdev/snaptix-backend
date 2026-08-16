import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ProfileSchemas } from '@snaptix/contracts/schemas/profile.schemas';

const completeProfileSchema = z.object({
  username: ProfileSchemas.username,
  firstName: ProfileSchemas.firstName,
  lastName: ProfileSchemas.lastName,
  birthDate: ProfileSchemas.birthDate,
  aboutMe: ProfileSchemas.aboutMe,
  countryId: ProfileSchemas.countryId,
  regionId: ProfileSchemas.regionId,
  cityId: ProfileSchemas.cityId,
});

export class CompleteProfileRequestDto extends createZodDto(
  completeProfileSchema,
) {}
