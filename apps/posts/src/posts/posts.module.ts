import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { PostConverter } from './converter/post.converter';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { CreatePostUseCase } from './application/commands/create-post.usecase';
import { GetPostByIdQueryHandler } from './application/queries/get-post-by-id.usecase';

@Module({
  controllers: [PostsController],
  providers: [
    PostConverter,
    PostsRepository,
    PostsQueryRepository,
    CreatePostUseCase,
    GetPostByIdQueryHandler,
  ],
})
export class PostsModule {}
