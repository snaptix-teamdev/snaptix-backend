import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import {
  GetUserPostsMsResponseDto,
  GetUserPostsPayload,
} from '@snaptix/contracts';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';

export class GetUserPostsQuery extends Query<GetUserPostsMsResponseDto> {
  constructor(public payload: GetUserPostsPayload) {
    super();
  }
}

@QueryHandler(GetUserPostsQuery)
export class GetUserPostsQueryHandler implements IQueryHandler<
  GetUserPostsQuery,
  GetUserPostsMsResponseDto
> {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute({
    payload,
  }: GetUserPostsQuery): Promise<GetUserPostsMsResponseDto> {
    const { posts, nextCursorId } =
      await this.postsQueryRepository.findByUserId(
        payload.userId,
        payload.cursorId,
        payload.pageSize,
      );

    return {
      posts: posts.map((p) => ({
        id: p.id,
        description: p.description,
        media: p.media.map((m) => ({
          id: m.fileId,
          storageKey: m.storageKey,
        })),
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
      })),
      nextCursorId,
    };
  }
}
