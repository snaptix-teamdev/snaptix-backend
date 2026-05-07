import { Injectable } from '@nestjs/common';
import { IPost } from '@snaptix/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class PostsQueryRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<IPost | null> {
    return this.prisma.post.findUnique({
      where: { id, deletedAt: null },
    });
  }
}
