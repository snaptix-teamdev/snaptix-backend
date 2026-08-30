import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { DomainException, IUser, IUserProfile } from '@snaptix/common';
import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';
import { UsersQueryRepository } from '../../../infrastructure/query/users.query-repository';
import { formatBirthDate } from '../helpers/birth-date.helper';

class GetProfileSettingsQueryPayload {
  userId: string;
}

class GetProfileSettingsQueryResponse
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

export class GetProfileSettingsQuery extends Query<GetProfileSettingsQueryResponse> {
  constructor(public payload: GetProfileSettingsQueryPayload) {
    super();
  }
}

@QueryHandler(GetProfileSettingsQuery)
export class GetProfileSettingsQueryHandler implements IQueryHandler<
  GetProfileSettingsQuery,
  GetProfileSettingsQueryResponse
> {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async execute({
    payload,
  }: GetProfileSettingsQuery): Promise<GetProfileSettingsQueryResponse> {
    const user = await this.usersQueryRepository.findByIdWithProfile(
      payload.userId,
    );

    if (!user) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.USER_NOT_FOUND);
    }

    const { profile } = user;

    return {
      userId: user.id,
      username: user.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      birthDate: formatBirthDate(profile.birthDate),
      aboutMe: profile.aboutMe,
      countryId: profile.countryId,
      regionId: profile.regionId,
      cityId: profile.cityId,
    };
  }
}
