import { DomainException, IPost } from '@snaptix/common';
import { POSTS_ERRORS } from '@snaptix/contracts';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostMediaEntity } from './post-media.entity';

export class PostEntity implements IPost {
  id: string;
  description: string | null;
  userId: string;
  media: PostMediaEntity[];
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;

  private constructor() {}

  static create(dto: CreatePostDto): PostEntity {
    if (dto.media.length < 1 || dto.media.length > 10) {
      throw new DomainException(POSTS_ERRORS.POST_MEDIA_COUNT_INVALID);
    }

    const entity = new PostEntity();

    entity.id = dto.id;
    entity.userId = dto.userId;
    entity.description = dto.description;
    entity.deletedAt = null;
    entity.media = dto.media.map((m, i) =>
      PostMediaEntity.create({
        fileId: m.fileId,
        storageKey: m.storageKey,
        order: i,
      }),
    );

    return entity;
  }

  static restore(model: IPost): PostEntity {
    const entity = new PostEntity();

    Object.assign(entity, {
      ...model,
      media: model.media.map((m) => PostMediaEntity.restore(m)),
    });

    return entity;
  }

  isOwner(userId: string): boolean {
    return this.userId === userId;
  }

  update(dto: UpdatePostDto): void {
    if (dto.description !== undefined) this.description = dto.description;
  }
}
