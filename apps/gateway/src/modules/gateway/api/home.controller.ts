import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  GetLatestPostsQueryRequestDto,
  GetLatestPostsResponseDto,
} from '@snaptix/contracts';
import { PostsService } from '../application/posts.service';

@Controller({ path: 'home', version: '1' })
export class HomeController {
  constructor(private postsService: PostsService) {}

  /**
   * Последние посты всех пользователей
   */
  @Get('latest-posts')
  @HttpCode(HttpStatus.OK)
  async getLatestPosts(
    @Query() query: GetLatestPostsQueryRequestDto,
  ): Promise<GetLatestPostsResponseDto> {
    return this.postsService.getLatestPosts(query.pageSize);
  }
}
