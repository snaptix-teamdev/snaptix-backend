import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

@Injectable()
export class UsersQueryRepository {
  constructor(private prisma: PrismaService) {}

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
