import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreatePostMsResponseDto,
  CreatePostPayload,
  CreatePostRequestDto,
  GetLatestPostsMsResponseDto,
  GetLatestPostsPayload,
  GetLatestPostsResponseDto,
  GetMePayload,
  GetMeResponseDto,
  GetMyPostsMsResponseDto,
  GetMyPostsPayload,
  GetMyPostsResponseDto,
  GetPostByIdMsResponseDto,
  GetUserPostsMsResponseDto,
  GetUserPostsPayload,
  GetUserPostsResponseDto,
  GetPostByIdPayload,
  GetPostByIdResponseDto,
  MICROSERVICE_NAME,
  POSTS_PATTERNS,
  USER_ACCOUNTS_PATTERNS,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { GatewayConfig } from '../gateway.config';
import { PostViewDto } from '../api/mappers/post.mapper';

@Injectable()
export class PostAggregationService {
  constructor(
    @Inject(MICROSERVICE_NAME.POSTS) private posts: ClientProxy,
    @Inject(MICROSERVICE_NAME.USER_ACCOUNTS) private userAccounts: ClientProxy,
    private gatewayConfig: GatewayConfig,
  ) {}

  async getPostById(postId: string): Promise<GetPostByIdResponseDto> {
    const post = await firstValueFrom(
      this.posts.send<GetPostByIdMsResponseDto, GetPostByIdPayload>(
        POSTS_PATTERNS.GET_POST_BY_ID,
        { id: postId },
      ),
    );

    const userInfo = await this.getUserInfoById(post.userId);

    return new PostViewDto({
      post,
      baseS3Url: this.gatewayConfig.filesStorageBaseUrl,
      userInfo: {
        userId: post.userId,
        avatar: null,
        username: userInfo.username,
      },
    });
  }

  async createPost(payload: {
    userId: string;
    body: CreatePostRequestDto;
  }): Promise<GetPostByIdResponseDto> {
    const post = await firstValueFrom(
      this.posts.send<CreatePostMsResponseDto, CreatePostPayload>(
        POSTS_PATTERNS.CREATE_POST,
        {
          userId: payload.userId,
          description: payload.body.description,
          media: payload.body.media,
        },
      ),
    );

    const userInfo = await this.getUserInfoById(payload.userId);

    return new PostViewDto({
      post,
      baseS3Url: this.gatewayConfig.filesStorageBaseUrl,
      userInfo: {
        userId: userInfo.id,
        username: userInfo.username,
        avatar: null,
      },
    });
  }

  async getLatestPosts(pageSize: number): Promise<GetLatestPostsResponseDto> {
    const { posts } = await firstValueFrom(
      this.posts.send<GetLatestPostsMsResponseDto, GetLatestPostsPayload>(
        POSTS_PATTERNS.GET_LATEST_POSTS,
        { pageSize },
      ),
    );

    const uniqueUserIds = [...new Set(posts.map((p) => p.userId))];
    const usersProfiles = await Promise.all(
      uniqueUserIds.map((id) => this.getUserInfoById(id)),
    );

    const usersMap = new Map(usersProfiles.map((u) => [u.id, u]));

    const aggregatedPosts: GetLatestPostsResponseDto = { posts: [] };

    posts.forEach((post) => {
      const userInfo = usersMap.has(post.userId)
        ? usersMap.get(post.userId)
        : null;

      if (userInfo) {
        aggregatedPosts.posts.push(
          new PostViewDto({
            post,
            baseS3Url: this.gatewayConfig.filesStorageBaseUrl,
            userInfo: {
              userId: post.userId,
              username: userInfo.username,
              avatar: null,
            },
          }),
        );
      }
    });

    return aggregatedPosts;
  }

  async getMyPosts(payload: {
    userId: string;
    cursorId?: string;
    pageSize?: number;
  }): Promise<GetMyPostsResponseDto> {
    const response = await firstValueFrom(
      this.posts.send<GetMyPostsMsResponseDto, GetMyPostsPayload>(
        POSTS_PATTERNS.GET_MY_POSTS,
        {
          userId: payload.userId,
          cursorId: payload.cursorId,
          pageSize: payload.pageSize,
        },
      ),
    );

    const userInfo = await this.getUserInfoById(payload.userId);

    return {
      posts: response.posts.map(
        (p) =>
          new PostViewDto({
            post: p,
            baseS3Url: this.gatewayConfig.filesStorageBaseUrl,
            userInfo: {
              userId: payload.userId,
              username: userInfo.username,
              avatar: null,
            },
          }),
      ),
      nextCursorId: response.nextCursorId,
    };
  }

  async getUserPosts(payload: {
    userId: string;
    cursorId?: string;
    pageSize?: number;
  }): Promise<GetUserPostsResponseDto> {
    const response = await firstValueFrom(
      this.posts.send<GetUserPostsMsResponseDto, GetUserPostsPayload>(
        POSTS_PATTERNS.GET_USER_POSTS,
        {
          userId: payload.userId,
          cursorId: payload.cursorId,
          pageSize: payload.pageSize,
        },
      ),
    );

    const userInfo = await this.getUserInfoById(payload.userId);

    return {
      posts: response.posts.map(
        (p) =>
          new PostViewDto({
            post: p,
            baseS3Url: this.gatewayConfig.filesStorageBaseUrl,
            userInfo: {
              userId: payload.userId,
              username: userInfo.username,
              avatar: null,
            },
          }),
      ),
      nextCursorId: response.nextCursorId,
    };
  }

  private getUserInfoById(userId: string): Promise<GetMeResponseDto> {
    return firstValueFrom(
      this.userAccounts.send<GetMeResponseDto, GetMePayload>(
        USER_ACCOUNTS_PATTERNS.AUTH.GET_ME,
        { id: userId },
      ),
    );
  }
}
