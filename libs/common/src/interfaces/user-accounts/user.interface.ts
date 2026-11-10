import {
  IUserEmailConfirmation,
  IUserProfile,
  IUserRecoveryPassword,
} from '@snaptix/common/interfaces';

/**
 * Доменный контракт агрегата User: что гарантирует сущность и на что опирается
 * application-слой.
 *
 * НЕ является моделью Prisma. Форму данных БД описывает `UserPrismaModel`
 * в apps/user-accounts/src/infrastructure/prisma/models/user.prisma-model.ts —
 * там `emailConfirmation` nullable, потому что связь в схеме опциональна.
 */
export interface IUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string | null;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
  profile: IUserProfile;
  emailConfirmation: IUserEmailConfirmation;
  recoveryPassword: IUserRecoveryPassword | null;
}
