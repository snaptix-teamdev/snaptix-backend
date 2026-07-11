import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserProviderEntity } from '../accounts/domain/user-provider/user-provider.entity';
import { UserProviderConverter } from '../accounts/converters/user-provider.converter';
import { OAuthProviderType } from '@snaptix/common';

@Injectable()
export class UserProvidersRepository {
  constructor(
    private prisma: PrismaService,
    private userProviderConverter: UserProviderConverter,
  ) {}

  // TODO: рассмотреть вариант IUserProvider: IUser | null
  async findByEmail(email: string): Promise<UserProviderEntity | null> {
    const result = await this.prisma.userProvider.findFirst({
      where: { email },
      include: {
        user: {
          include: {
            emailConfirmation: true,
            recoveryPassword: true,
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    if (!result.user.emailConfirmation) {
      throw new Error('user email confirmation is missing');
    }

    return this.userProviderConverter.fromPrismaModelToEntity({
      ...result,
      user: {
        ...result.user,
        emailConfirmation: result.user.emailConfirmation,
      },
    });
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
      include: {
        user: {
          include: {
            emailConfirmation: true,
            recoveryPassword: true,
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    if (!result.user.emailConfirmation) {
      throw new Error('user email confirmation is missing');
    }

    return this.userProviderConverter.fromPrismaModelToEntity({
      ...result,
      user: {
        ...result.user,
        emailConfirmation: result.user.emailConfirmation,
      },
    });
  }

  async updateEmail(entity: UserProviderEntity): Promise<void> {
    const model = this.userProviderConverter.fromEntityToPrismaModel(entity);

    await this.prisma.userProvider.update({
      where: { id: model.id },
      data: { email: model.email },
    });
  }
}
