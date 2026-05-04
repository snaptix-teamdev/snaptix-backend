import { DomainException, IPost } from '@snaptix/common';
import { POSTS_ERRORS } from '@snaptix/contracts';
import { CreatePostDto } from './dto/create-post.dto';

export class PostEntity implements IPost {
  id: string;
  description: string | null;
  userId: string;
  media: string[];
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;

  private constructor() {}

  static create(dto: CreatePostDto): PostEntity {
    if (dto.media.length < 1 || dto.media.length > 10) {
      throw new DomainException(POSTS_ERRORS.POST_ATTACHMENTS_COUNT_INVALID);
    }

    const entity = new PostEntity();

    entity.userId = dto.userId;
    entity.description = dto.description;
    entity.media = dto.media;
    entity.deletedAt = null;

    return entity;
  }

  static restore(model: IPost): PostEntity {
    const entity = new PostEntity();

    Object.assign(entity, model);

    return entity;
  }
}
