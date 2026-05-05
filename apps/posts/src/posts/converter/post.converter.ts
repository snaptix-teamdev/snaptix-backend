import { Injectable } from '@nestjs/common';
import { IPost, UniversalConverter } from '@snaptix/common';
import { PostEntity } from '../domain/post.entity';

const modelToEntity = (model: IPost): PostEntity => PostEntity.restore(model);

const entityToModel = (entity: PostEntity): IPost => ({
  id: entity.id,
  description: entity.description,
  userId: entity.userId,
  media: entity.media,
  updatedAt: entity.updatedAt,
  createdAt: entity.createdAt,
  deletedAt: entity.deletedAt,
});

@Injectable()
export class PostConverter extends UniversalConverter<PostEntity, IPost> {
  constructor() {
    super(modelToEntity, entityToModel);
  }
}
