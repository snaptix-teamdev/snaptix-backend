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

  async findByUserId(
    userId: string,
    cursorId?: string,
    pageSize: number = 10,
  ): Promise<{ posts: IPost[]; nextCursorId: string | null }> {
    const limit = pageSize + 1;

    const posts = await this.prisma.post.findMany({
      where: { userId, deletedAt: null },
      cursor: cursorId ? { id: cursorId } : undefined,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: POST_INCLUDE,
    });

    const hasMore = posts.length === limit;
    const resultPosts = hasMore ? posts.slice(0, pageSize) : posts;

    const nextCursorId = hasMore ? posts[posts.length - 1].id : null;

    return { posts: resultPosts, nextCursorId };
  }
}
