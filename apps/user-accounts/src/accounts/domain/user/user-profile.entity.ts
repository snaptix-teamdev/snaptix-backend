import { DomainException, IUserProfile } from '@snaptix/common';
import { UpdateUserProfileEntityDto } from './dto/user-update-profile.entity-dto';
import { differenceInYears } from 'date-fns';
import { USER_ACCOUNTS_ERRORS } from '@snaptix/contracts';

const birthDateConstraints = {
  minAgeYears: 13,
};

export class UserProfileEntity implements IUserProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: Date | null;
  countryId: number | null;
  regionId: number | null;
  cityId: number | null;
  aboutMe: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor() {}

  static create(): UserProfileEntity {
    return new this();
  }

  static restore(model: IUserProfile): UserProfileEntity {
    const entity = new this();
    Object.assign(entity, model);
    return entity;
  }

  private checkBirthDateOrThrow(birthDate: Date | null | undefined): void {
    if (
      birthDate &&
      differenceInYears(new Date(), birthDate) <
        birthDateConstraints.minAgeYears
    ) {
      throw new DomainException(USER_ACCOUNTS_ERRORS.USER_UNDER_MIN_AGE);
    }
  }

  update(dto: UpdateUserProfileEntityDto): void {
    this.checkBirthDateOrThrow(dto.birthDate);

    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.birthDate = dto.birthDate;
    this.aboutMe = dto.aboutMe;
    this.countryId = dto.countryId;
    this.regionId = dto.regionId;
    this.cityId = dto.cityId;
  }
}
