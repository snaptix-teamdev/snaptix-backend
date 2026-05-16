import { Injectable } from '@nestjs/common';
import { IPost } from '@snaptix/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

const POST_INCLUDE = {
  media: { orderBy: { order: 'asc' } },
} satisfies Prisma.PostInclude;

@Injectable()
export class PostsQueryRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<IPost | null> {
    return this.prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: POST_INCLUDE,
    });
  }
}
