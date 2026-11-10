import { USER_INCLUDE } from './user.prisma-model';
import { Prisma } from '../../../generated/prisma/client';

export const USER_PROVIDER_INCLUDE = {
  user: { include: USER_INCLUDE },
} satisfies Prisma.UserProviderInclude;

export type UserProviderPrismaModel = Prisma.UserProviderGetPayload<{
  include: typeof USER_PROVIDER_INCLUDE;
}>;
