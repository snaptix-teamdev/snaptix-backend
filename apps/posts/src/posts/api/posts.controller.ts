import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreatePostMsResponseDto,
  CreatePostPayload,
  DeletePostPayload,
  GetMyPostsMsResponseDto,
  GetMyPostsPayload,
  GetPostByIdMsResponseDto,
  GetPostByIdPayload,
  GetUserPostsMsResponseDto,
  GetUserPostsPayload,
  POSTS_PATTERNS,
  UpdatePostMsResponseDto,
  UpdatePostPayload,
} from '@snaptix/contracts';
import { CreatePostCommand } from '../application/commands/create-post.usecase';
import { DeletePostCommand } from '../application/commands/delete-post.usecase';
import { UpdatePostCommand } from '../application/commands/update-post.usecase';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.usecase';
import { GetMyPostsQuery } from '../application/queries/get-my-posts.usecase';
import { GetUserPostsQuery } from '../application/queries/get-user-posts.usecase';

@Controller()
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @MessagePattern(POSTS_PATTERNS.CREATE_POST)
  async createPost(
    @Payload() payload: CreatePostPayload,
  ): Promise<CreatePostMsResponseDto> {
    const { id } = await this.commandBus.execute(
      new CreatePostCommand(payload),
    );
    return this.queryBus.execute(new GetPostByIdQuery({ id }));
  }

  @MessagePattern(POSTS_PATTERNS.GET_POST_BY_ID)
  async getPostById(
    @Payload() payload: GetPostByIdPayload,
  ): Promise<GetPostByIdMsResponseDto> {
    return this.queryBus.execute(new GetPostByIdQuery({ id: payload.id }));
  }

  @MessagePattern(POSTS_PATTERNS.GET_MY_POSTS)
  async getMyPosts(
    @Payload() payload: GetMyPostsPayload,
  ): Promise<GetMyPostsMsResponseDto> {
    return this.queryBus.execute(new GetMyPostsQuery(payload));
  }

  @MessagePattern(POSTS_PATTERNS.GET_USER_POSTS)
  async getUserPosts(
    @Payload() payload: GetUserPostsPayload,
  ): Promise<GetUserPostsMsResponseDto> {
    return this.queryBus.execute(new GetUserPostsQuery(payload));
  }

  @MessagePattern(POSTS_PATTERNS.UPDATE_POST)
  async updatePost(
    @Payload() payload: UpdatePostPayload,
  ): Promise<UpdatePostMsResponseDto> {
    await this.commandBus.execute(new UpdatePostCommand(payload));

    return {};
  }

  @MessagePattern(POSTS_PATTERNS.DELETE_POST)
  async deletePost(@Payload() payload: DeletePostPayload): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(payload));
  }
}
