import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PostConverter } from '../converter/post.converter';
import { PostEntity } from '../domain/post.entity';
import { Prisma } from '../../generated/prisma/client';

const POST_INCLUDE = {
  media: { orderBy: { order: 'asc' } },
} satisfies Prisma.PostInclude;

@Injectable()
export class PostsRepository {
  constructor(
    private prisma: PrismaService,
    private postConverter: PostConverter,
  ) {}

  async create(entity: PostEntity): Promise<PostEntity> {
    const result = await this.prisma.post.create({
      data: {
        id: entity.id,
        userId: entity.userId,
        description: entity.description,
        media: {
          create: entity.media.map((m) => ({
            fileId: m.fileId,
            storageKey: m.storageKey,
            order: m.order,
          })),
        },
      },
      include: POST_INCLUDE,
    });

    return this.postConverter.fromPrismaModelToEntity(result);
  }

  async findById(id: string): Promise<PostEntity | null> {
    const model = await this.prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: POST_INCLUDE,
    });

    if (!model) return null;

    return this.postConverter.fromPrismaModelToEntity(model);
  }

  async update(entity: PostEntity): Promise<void> {
    await this.prisma.post.update({
      where: { id: entity.id },
      data: { description: entity.description },
    });
  }

  async softDelete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx ?? this.prisma;
    await client.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
