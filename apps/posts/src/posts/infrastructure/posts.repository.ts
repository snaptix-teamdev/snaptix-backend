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

  async findById(id: string): Promise<PostEntity | null> {
    const model = await this.prisma.post.findUnique({
      where: { id, deletedAt: null },
    });

    if (!model) return null;

    return this.postConverter.fromPrismaModelToEntity(model);
  }

  async update(entity: PostEntity): Promise<void> {
    const model = this.postConverter.fromEntityToPrismaModel(entity);

    const { updatedAt: _updatedAt, ...rest } = model;

    await this.prisma.post.update({
      where: { id: model.id },
      data: { ...rest },
    });
  }
}
