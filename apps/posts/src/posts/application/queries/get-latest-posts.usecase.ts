import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { GetLatestPostsMsResponseDto } from '@snaptix/contracts';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';

class GetLatestPostsQueryPayload {
  pageSize: number;
}

export class GetLatestPostsQuery extends Query<GetLatestPostsMsResponseDto> {
  constructor(public payload: GetLatestPostsQueryPayload) {
    super();
  }
}

@QueryHandler(GetLatestPostsQuery)
export class GetLatestPostsQueryHandler implements IQueryHandler<
  GetLatestPostsQuery,
  GetLatestPostsMsResponseDto
> {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute({
    payload,
  }: GetLatestPostsQuery): Promise<GetLatestPostsMsResponseDto> {
    const posts = await this.postsQueryRepository.findLatestPosts(
      payload.pageSize,
    );

    return {
      posts: posts.map((p) => ({
        id: p.id,
        description: p.description,
        userId: p.userId,
        media: p.media.map((m) => ({ id: m.fileId, storageKey: m.storageKey })),
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
      })),
    };
  }
}
