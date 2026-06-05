import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  GetMyPostsRequestDto,
  GetMyPostsResponseDto,
  GetUserPostsQueryRequestDto,
  GetUserPostsResponseDto,
} from '@snaptix/contracts';
import { AccessTokenAuthGuard } from '../../../core/guards/bearer/access-token.guard';
import { AccessTokenOptionalAuthGuard } from '../../../core/guards/bearer/access-token-optional-auth.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '@snaptix/common/dto/user-context.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiUnauthorizedCustomResponse } from '../../../core/swagger/unauthorized.swagger';
import { ApiBadRequestCustomResponse } from '../../../core/swagger/bad-request.swagger';
import { UUIDValidationOrBadRequestPipe } from '../../../core/pipes/uuid-validation.pipe';
import { PostAggregationService } from '../application/post-aggregation.service';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private postAggregationService: PostAggregationService) {}

  /**
   * Получение своих постов (cursor pagination)
   */
  @Get('me/posts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: `
Возвращает посты текущего пользователя с пагинацией по курсору.
\nПередайте \`cursorId\` из предыдущего ответа для получения следующей страницы`,
  })
  @ApiUnauthorizedCustomResponse()
  async getMyPosts(
    @Query() query: GetMyPostsRequestDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GetMyPostsResponseDto> {
    return this.postAggregationService.getMyPosts({
      userId: user.userId,
      cursorId: query.cursorId,
      pageSize: query.pageSize,
    });
  }

  /**
   * Получение постов пользователя по userId (cursor pagination)
   */
  @Get(':userId/posts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenOptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: `
Возвращает посты пользователя с пагинацией по курсору.
\nАвторизация опциональная — запрос доступен как авторизованному, так и неавторизованному пользователю.
\nПередайте \`cursorId\` из предыдущего ответа для получения следующей страницы`,
  })
  @ApiBadRequestCustomResponse()
  async getUserPosts(
    @Param('userId', UUIDValidationOrBadRequestPipe) userId: string,
    @Query() query: GetUserPostsQueryRequestDto,
  ): Promise<GetUserPostsResponseDto> {
    return this.postAggregationService.getUserPosts({
      userId,
      cursorId: query.cursorId,
      pageSize: query.pageSize,
    });
  }
}
