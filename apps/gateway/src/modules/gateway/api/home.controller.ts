import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  GetLatestPostsQueryRequestDto,
  GetLatestPostsResponseDto,
} from '@snaptix/contracts';
import { HomeService } from '../application/home.service';

@Controller({ path: 'home', version: '1' })
export class HomeController {
  constructor(private homeService: HomeService) {}

  /**
   * Последние посты всех пользователей
   */
  @Get('latest-posts')
  @HttpCode(HttpStatus.OK)
  async getLatestPosts(
    @Query() query: GetLatestPostsQueryRequestDto,
  ): Promise<GetLatestPostsResponseDto> {
    return this.homeService.getLatestPosts(query.pageSize);
  }
}
