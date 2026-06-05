import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { GetMyPostsMsResponseDto, GetMyPostsPayload } from '@snaptix/contracts';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';

export class GetMyPostsQuery extends Query<GetMyPostsMsResponseDto> {
  constructor(public payload: GetMyPostsPayload) {
    super();
  }
}

@QueryHandler(GetMyPostsQuery)
export class GetMyPostsQueryHandler implements IQueryHandler<
  GetMyPostsQuery,
  GetMyPostsMsResponseDto
> {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute({
    payload,
  }: GetMyPostsQuery): Promise<GetMyPostsMsResponseDto> {
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
        userId: p.userId,
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
