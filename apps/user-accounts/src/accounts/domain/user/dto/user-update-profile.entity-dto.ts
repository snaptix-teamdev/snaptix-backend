import { IUserProfile } from '@snaptix/common';

export type UpdateUserProfileEntityDto = Pick<
  IUserProfile,
  | 'firstName'
  | 'lastName'
  | 'birthDate'
  | 'aboutMe'
  | 'countryId'
  | 'regionId'
  | 'cityId'
>;
