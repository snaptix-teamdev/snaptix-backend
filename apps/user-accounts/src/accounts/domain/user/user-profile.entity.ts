import { IUserProfile } from '@snaptix/common';
import { UpdateUserProfileEntityDto } from './dto/user-update-profile.entity-dto';

export class UserProfileEntity implements IUserProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: Date | undefined | null;
  countryId: number | null;
  regionId: number | null;
  cityId: number | null;
  aboutMe: string | undefined | null;
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

  update(dto: UpdateUserProfileEntityDto): void {
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.birthDate = dto.birthDate;
    this.aboutMe = dto.aboutMe;
    this.countryId = dto.countryId;
    this.regionId = dto.regionId;
    this.cityId = dto.cityId;
  }
}
