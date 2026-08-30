import { IUser, IUserProfile } from '@snaptix/common';

export class GetProfileSettingsMsResponseDto
  implements
    Pick<
      IUserProfile,
      | 'userId'
      | 'firstName'
      | 'lastName'
      | 'aboutMe'
      | 'countryId'
      | 'regionId'
      | 'cityId'
    >,
    Pick<IUser, 'username'>
{
  userId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  aboutMe: string | null;
  countryId: number | null;
  regionId: number | null;
  cityId: number | null;
}
