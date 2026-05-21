import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  GetLatestPostsMsResponseDto,
  GetLatestPostsPayload,
  GetLatestPostsResponseDto,
  MICROSERVICE_NAME,
  POSTS_PATTERNS,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { GatewayConfig } from '../gateway.config';
import { LatestPostViewDto } from '../api/mappers/latest-post.mapper';

@Injectable()
export class PostsService {
  constructor(
    @Inject(MICROSERVICE_NAME.POSTS) private posts: ClientProxy,
    @Inject(MICROSERVICE_NAME.USER_ACCOUNTS) private userAccounts: ClientProxy,
    private gatewayConfig: GatewayConfig,
  ) {}

  async getLatestPosts(pageSize: number): Promise<GetLatestPostsResponseDto> {
    const { posts } = await firstValueFrom(
      this.posts.send<GetLatestPostsMsResponseDto, GetLatestPostsPayload>(
        POSTS_PATTERNS.GET_LATEST_POSTS,
        { pageSize },
      ),
    );

    // const uniqueUserIds = [...new Set(posts.map((p) => p.userId))];
    //TODO добавить запрос получения профилей юзеров по ids
    // const usersProfiles = ...
    // const userMap = new Map(usersProfiles.map((u) => [u.id, u]));

    return {
      posts: posts.map(
        (p) =>
          new LatestPostViewDto({
            post: p,
            baseS3Url: this.gatewayConfig.filesStorageBaseUrl,
            userInfo: {
              avatar: null,
              lastName: 'Mocked',
              firstName: 'Mocked',
            },
          }),
      ),
    };
  }
}
