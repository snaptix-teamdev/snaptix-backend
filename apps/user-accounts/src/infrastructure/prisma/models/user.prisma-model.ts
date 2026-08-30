import { Prisma } from '../../../generated/prisma/client';
import {
  requireLoadedRelations,
  WithLoadedRelations,
} from '../helpers/loaded-relations.helper';

/** Единственный источник истины: какие связи агрегата User грузятся из БД. */
export const USER_INCLUDE = {
  emailConfirmation: true,
  recoveryPassword: true,
  profile: true,
} satisfies Prisma.UserInclude;

/** Ровно то, что возвращает Prisma. Обязательные связи здесь ещё nullable. */
export type UserPrismaModel = Prisma.UserGetPayload<{
  include: typeof USER_INCLUDE;
}>;

/** Связи, отсутствие которых означает нарушенную консистентность агрегата. */
const USER_REQUIRED_RELATIONS = ['emailConfirmation', 'profile'] as const;

/** Prisma-модель, прошедшая проверку консистентности. Совместима с `IUser`. */
export type LoadedUserPrismaModel = WithLoadedRelations<
  UserPrismaModel,
  (typeof USER_REQUIRED_RELATIONS)[number]
>;

export function requireLoadedUser(
  model: UserPrismaModel,
): LoadedUserPrismaModel {
  return requireLoadedRelations(model, USER_REQUIRED_RELATIONS, 'User');
}
