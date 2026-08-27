import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { requireLoadedRelations } from '../prisma/helpers/loaded-relations.helper';

@Injectable()
export class UsersQueryRepository {
  constructor(private prisma: PrismaService) {}

  async getRegisteredUsersCount(): Promise<number> {
    return this.prisma.user.count({
      where: {
        deletedAt: null,
        emailConfirmation: { isVerified: true },
      },
    });
  }

  async findByIdWithProfile(id: string) {
    const result = await this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        profile: true,
      },
    });

    if (!result) return null;

    return requireLoadedRelations(result, ['profile'], 'User');
  }

  async findById(id: string) {
    const result = await this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        emailConfirmation: true,
        recoveryPassword: true,
      },
    });

    if (result && !result.emailConfirmation) {
      throw new Error('user email confirmation is missing');
    }

    return result;
  }
}
