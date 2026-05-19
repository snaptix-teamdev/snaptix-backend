import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  GetMyPostsMsResponseDto,
  GetMyPostsPayload,
  GetMyPostsRequestDto,
  GetMyPostsResponseDto,
  GetUserPostsMsResponseDto,
  GetUserPostsPayload,
  GetUserPostsRequestDto,
  GetUserPostsResponseDto,
  MICROSERVICE_NAME,
  POSTS_PATTERNS,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { AccessTokenAuthGuard } from '../../../core/guards/bearer/access-token.guard';
import { AccessTokenOptionalAuthGuard } from '../../../core/guards/bearer/access-token-optional-auth.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '@snaptix/common/dto/user-context.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiUnauthorizedCustomResponse } from '../../../core/swagger/unauthorized.swagger';
import { ApiBadRequestCustomResponse } from '../../../core/swagger/bad-request.swagger';
import { UUIDValidationOrBadRequestPipe } from '../../../core/pipes/uuid-validation.pipe';
import { GatewayConfig } from '../gateway.config';
import { PostViewDto } from './mappers/post.mapper';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    @Inject(MICROSERVICE_NAME.POSTS) private posts: ClientProxy,
    private gatewayConfig: GatewayConfig,
  ) {}

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
    const result = this.posts.send<GetMyPostsMsResponseDto, GetMyPostsPayload>(
      POSTS_PATTERNS.GET_MY_POSTS,
      {
        userId: user.userId,
        cursorId: query.cursorId,
        pageSize: query.pageSize,
      },
    );

    const response = await firstValueFrom(result);

    return {
      posts: response.posts.map(
        (p) => new PostViewDto(p, this.gatewayConfig.filesStorageBaseUrl),
      ),
      nextCursorId: response.nextCursorId,
    };
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
    @Query() query: GetUserPostsRequestDto,
  ): Promise<GetUserPostsResponseDto> {
    const result = this.posts.send<
      GetUserPostsMsResponseDto,
      GetUserPostsPayload
    >(POSTS_PATTERNS.GET_USER_POSTS, {
      userId,
      cursorId: query.cursorId,
      pageSize: query.pageSize,
    });

    const response = await firstValueFrom(result);

    return {
      posts: response.posts.map(
        (p) => new PostViewDto(p, this.gatewayConfig.filesStorageBaseUrl),
      ),
      nextCursorId: response.nextCursorId,
    };
  }
}
