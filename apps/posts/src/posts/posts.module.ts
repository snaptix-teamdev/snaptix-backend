import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { PostConverter } from './converter/post.converter';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { CreatePostUseCase } from './application/commands/create-post.usecase';
import { DeletePostUseCase } from './application/commands/delete-post.usecase';
import { UpdatePostUseCase } from './application/commands/update-post.usecase';
import { GetPostByIdQueryHandler } from './application/queries/get-post-by-id.usecase';
import { GetMyPostsQueryHandler } from './application/queries/get-my-posts.usecase';
import { GetUserPostsQueryHandler } from './application/queries/get-user-posts.usecase';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAME } from '@snaptix/contracts';
import { CoreConfig } from '../core/config/core.config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_NAME.FILES,
        inject: [CoreConfig],
        useFactory: (coreConfig: CoreConfig) => ({
          transport: Transport.TCP,
          options: {
            host: coreConfig.microserviceFilesHost,
            port: coreConfig.microserviceFilesPort,
          },
        }),
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [
    PostConverter,
    PostsRepository,
    PostsQueryRepository,
    CreatePostUseCase,
    DeletePostUseCase,
    UpdatePostUseCase,
    GetPostByIdQueryHandler,
    GetMyPostsQueryHandler,
    GetUserPostsQueryHandler,
  ],
})
export class PostsModule {}
