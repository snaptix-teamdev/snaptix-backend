import { IPostMedia } from '@snaptix/common';
import { CreatePostMediaEntityDto } from './dto/create-post-media.entity-dto';

export class PostMediaEntity implements IPostMedia {
  id: string;
  fileId: string;
  storageKey: string;
  order: number;

  private constructor() {}

  static create(dto: CreatePostMediaEntityDto): PostMediaEntity {
    const entity = new PostMediaEntity();

    entity.fileId = dto.fileId;
    entity.storageKey = dto.storageKey;
    entity.order = dto.order;

    return entity;
  }

  static restore(model: IPostMedia): PostMediaEntity {
    const entity = new PostMediaEntity();
    Object.assign(entity, model);
    return entity;
  }
}
