import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { IUser } from '@snaptix/common';
import { UserConverter } from '../accounts/converters/user.converter';
import { UserEntity } from '../accounts/domain/user/user.entity';
import { Prisma } from '../generated/prisma/client';
import { USER_INCLUDE } from './prisma/models/user.prisma-model';

@Injectable()
export class UsersRepository {
  constructor(
    private prisma: PrismaService,
    private userConverter: UserConverter,
  ) {}

  async create(
    entity: UserEntity,
    tx?: Prisma.TransactionClient,
  ): Promise<UserEntity> {
    const client = tx ?? this.prisma;
    const data = this.userConverter.fromEntityToPrismaModel(entity);

    const result = await client.user.create({
      data,
      include: USER_INCLUDE,
    });

    return this.userConverter.fromPrismaModelToEntity(result);
  }

  async update(entity: UserEntity): Promise<void> {
    const data = this.userConverter.fromEntityToUpdateInput(entity);

    await this.prisma.user.update({
      where: {
        id: entity.id,
      },
      data,
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

  async findById(id: string): Promise<UserEntity | null> {
    const result = await this.prisma.user.findUnique({
      where: { id },
      include: USER_INCLUDE,
    });

    return this.userConverter.fromPrismaModelToEntityOrNull(result);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.prisma.user.findUnique({
      where: { email },
      include: USER_INCLUDE,
    });

    return this.userConverter.fromPrismaModelToEntityOrNull(result);
  }

  async findByEmailCode(code: string): Promise<UserEntity | null> {
    const result = await this.prisma.user.findFirst({
      where: {
        emailConfirmation: {
          code,
        },
      },
      include: USER_INCLUDE,
    });

    return this.userConverter.fromPrismaModelToEntityOrNull(result);
  }

  async findByRecoveryPasswordCode(code: string): Promise<UserEntity | null> {
    const result = await this.prisma.user.findFirst({
      where: {
        recoveryPassword: {
          code,
        },
      },
      include: USER_INCLUDE,
    });

    return this.userConverter.fromPrismaModelToEntityOrNull(result);
  }
}
