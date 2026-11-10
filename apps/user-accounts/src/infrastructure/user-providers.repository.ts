import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserProviderEntity } from '../accounts/domain/user-provider/user-provider.entity';
import { UserProviderConverter } from '../accounts/converters/user-provider.converter';
import { OAuthProviderType } from '@snaptix/common';
import { Prisma } from '../generated/prisma/client';
import { USER_PROVIDER_INCLUDE } from './prisma/models/user-provider.prisma-model';

@Injectable()
export class UserProvidersRepository {
  constructor(
    private prisma: PrismaService,
    private userProviderConverter: UserProviderConverter,
  ) {}

  async findByEmail(email: string): Promise<UserProviderEntity | null> {
    const result = await this.prisma.userProvider.findFirst({
      where: { email },
      include: USER_PROVIDER_INCLUDE,
    });

    return this.userProviderConverter.fromPrismaModelToEntityOrNull(result);
  }

  async findByProviderAndProviderId(
    providerId: string,
    provider: OAuthProviderType,
  ): Promise<UserProviderEntity | null> {
    const result = await this.prisma.userProvider.findUnique({
      where: {
        provider_externalProviderId: {
          provider,
          externalProviderId: providerId,
        },
      },
      include: USER_PROVIDER_INCLUDE,
    });

    return this.userProviderConverter.fromPrismaModelToEntityOrNull(result);
  }

  async create(
    entity: UserProviderEntity,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    const data = this.userProviderConverter.fromEntityToPrismaModel(entity);

    await client.userProvider.create({ data });
  }

  async updateEmail(entity: UserProviderEntity): Promise<void> {
    await this.prisma.userProvider.update({
      where: { id: entity.id },
      data: { email: entity.email },
    });
  }

  async updateProviderIdAndEmail(entity: UserProviderEntity): Promise<void> {
    await this.prisma.userProvider.update({
      where: { id: entity.id },
      data: {
        email: entity.email,
        externalProviderId: entity.externalProviderId,
      },
    });
  }
}
