import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PostConverter } from '../converter/post.converter';
import { PostEntity } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    private prisma: PrismaService,
    private postConverter: PostConverter,
  ) {}

  async create(entity: PostEntity): Promise<PostEntity> {
    const model = this.postConverter.fromEntityToPrismaModel(entity);

    const result = await this.prisma.post.create({
      data: { ...model },
    });

    return this.postConverter.fromPrismaModelToEntity(result);
  }
}
