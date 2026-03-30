import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { UserConverter } from '../converter/user.converter';
import { UserEntity } from '../domain/user.entity';
import { IUser } from '@snaptix/common';

@Injectable()
export class UsersRepository {
  constructor(
    private prisma: PrismaService,
    private userConverter: UserConverter,
  ) {}

  async create(entity: UserEntity): Promise<UserEntity> {
    const model = this.userConverter.fromEntityToPrismaModel(entity);

    const result = await this.prisma.user.create({
      data: {
        ...model,
        emailConfirmation: {
          create: model.emailConfirmation,
        },
        recoveryPassword: {
          create: model.recoveryPassword ?? undefined,
        },
      },
      include: {
        emailConfirmation: true,
        recoveryPassword: true,
      },
    });

    if (!result.emailConfirmation) {
      throw new Error('user email confirmation is missing');
    }

    return this.userConverter.fromPrismaModelToEntity({
      ...result,
      emailConfirmation: result.emailConfirmation,
      recoveryPassword: result.recoveryPassword,
    });
  }

  async update(entity: UserEntity): Promise<void> {
    const model = this.userConverter.fromEntityToPrismaModel(entity);

    await this.prisma.user.update({
      where: {
        id: model.id,
      },
      data: {
        ...model,
        emailConfirmation: {
          update: model.emailConfirmation,
        },
        recoveryPassword: {
          update: model.recoveryPassword ?? undefined,
        },
      },
    });
  }

  async checkUserByEmailOrUsername(dto: Pick<IUser, 'username' | 'email'>) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
      select: {
        email: true,
        username: true,
      },
    });
  }

  async findOne(id: string): Promise<UserEntity | null> {
    const result = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        emailConfirmation: true,
        recoveryPassword: true,
      },
    });

    if (!result) {
      return null;
    }

    if (!result.emailConfirmation) {
      throw new Error('user email confirmation is missing');
    }

    return this.userConverter.fromPrismaModelToEntity({
      ...result,
      emailConfirmation: result.emailConfirmation,
      recoveryPassword: result.recoveryPassword,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        emailConfirmation: true,
        recoveryPassword: true,
      },
    });

    if (!result) {
      return null;
    }

    if (!result.emailConfirmation) {
      throw new Error('user email confirmation is missing');
    }

    return this.userConverter.fromPrismaModelToEntity({
      ...result,
      emailConfirmation: result.emailConfirmation,
      recoveryPassword: result.recoveryPassword,
    });
  }
}
