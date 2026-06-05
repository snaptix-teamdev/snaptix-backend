import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { DomainException } from '@snaptix/common';
import { GetPostByIdMsResponseDto, POSTS_ERRORS } from '@snaptix/contracts';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';

class GetPostByIdPayload {
  id: string;
}

export class GetPostByIdQuery extends Query<GetPostByIdMsResponseDto> {
  constructor(public payload: GetPostByIdPayload) {
    super();
  }
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<
  GetPostByIdQuery,
  GetPostByIdMsResponseDto
> {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute({
    payload,
  }: GetPostByIdQuery): Promise<GetPostByIdMsResponseDto> {
    const post = await this.postsQueryRepository.findById(payload.id);

    if (!post) {
      throw new DomainException(POSTS_ERRORS.POST_NOT_FOUND);
    }

    return {
      id: post.id,
      description: post.description,
      userId: post.userId,
      media: post.media.map((m) => ({
        id: m.fileId,
        storageKey: m.storageKey,
      })),
      updatedAt: post.updatedAt,
      createdAt: post.createdAt,
    };
  }
}
