import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreatePostMsResponseDto,
  CreatePostPayload,
  POSTS_PATTERNS,
} from '@snaptix/contracts';
import { CreatePostCommand } from '../application/commands/create-post.usecase';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.usecase';

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
}
