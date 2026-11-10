export interface IUserProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: Date | null;
  countryId: number | null;
  regionId: number | null;
  cityId: number | null;
  aboutMe: string | null;
  storageKey: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
