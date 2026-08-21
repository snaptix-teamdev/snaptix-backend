import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ProfileSchemas } from '@snaptix/contracts/schemas/profile.schemas';
import { CommonSchemas } from '@snaptix/contracts/schemas';

const completeProfileSchema = z.object({
  userId: CommonSchemas.uuid,
  username: ProfileSchemas.username,
  firstName: ProfileSchemas.firstName,
  lastName: ProfileSchemas.lastName,
  birthDate: ProfileSchemas.birthDate,
  aboutMe: ProfileSchemas.aboutMe,
  countryId: ProfileSchemas.countryId,
  regionId: ProfileSchemas.regionId,
  cityId: ProfileSchemas.cityId,
});

export class CompleteProfilePayload extends createZodDto(
  completeProfileSchema,
) {}
