import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  GetLatestPostsQueryRequestDto,
  GetLatestPostsResponseDto,
  GetRegisteredUsersCountResponseDto,
} from '@snaptix/contracts';
import { HomeService } from '../application/home.service';
import { PostAggregationService } from '../application/post-aggregation.service';

@Controller({ path: 'home', version: '1' })
export class HomeController {
  constructor(
    private postAggregationService: PostAggregationService,

    private homeService: HomeService,
  ) {}

  /**
   * Количество зарегистрированных пользователей (с подтверждённой почтой)
   */
  @Get('registered-users-count')
  @HttpCode(HttpStatus.OK)
  async getRegisteredUsersCount(): Promise<GetRegisteredUsersCountResponseDto> {
    return this.homeService.getRegisteredUsersCount();
  }

  /**
   * Последние посты всех пользователей
   */
  @Get('latest-posts')
  @HttpCode(HttpStatus.OK)
  async getLatestPosts(
    @Query() query: GetLatestPostsQueryRequestDto,
  ): Promise<GetLatestPostsResponseDto> {
    return this.postAggregationService.getLatestPosts(query.pageSize);
  }
}
