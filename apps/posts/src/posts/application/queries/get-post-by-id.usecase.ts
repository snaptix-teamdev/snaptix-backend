import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { DomainException } from '@snaptix/common';
import { CreatePostMsResponseDto, POSTS_ERRORS } from '@snaptix/contracts';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';

class GetPostByIdPayload {
  id: string;
}

export class GetPostByIdQuery extends Query<CreatePostMsResponseDto> {
  constructor(public payload: GetPostByIdPayload) {
    super();
  }
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<
  GetPostByIdQuery,
  CreatePostMsResponseDto
> {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute({
    payload,
  }: GetPostByIdQuery): Promise<CreatePostMsResponseDto> {
    const post = await this.postsQueryRepository.findById(payload.id);

    if (!post) {
      throw new DomainException(POSTS_ERRORS.POST_NOT_FOUND);
    }

    return {
      id: post.id,
      description: post.description,
      media: post.media.map((fileId) => ({ fileId })),
      updatedAt: post.updatedAt.toISOString(),
      createdAt: post.createdAt.toISOString(),
    };
  }
}
