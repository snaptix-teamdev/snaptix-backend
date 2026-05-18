import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  GetMyPostsMsResponseDto,
  GetMyPostsPayload,
  GetMyPostsRequestDto,
  GetMyPostsResponseDto,
  MICROSERVICE_NAME,
  POSTS_PATTERNS,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { AccessTokenAuthGuard } from '../../../core/guards/bearer/access-token.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '@snaptix/common/dto/user-context.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiUnauthorizedCustomResponse } from '../../../core/swagger/unauthorized.swagger';
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
    Возвращает посты текущего пользователя с пагинацией по курсору
    Передайте \`cursorId\` из предыдущего ответа для получения следующей страницы`,
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
}
