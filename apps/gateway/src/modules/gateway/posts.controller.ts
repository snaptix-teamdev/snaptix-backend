import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreatePostMsResponseDto,
  CreatePostPayload,
  CreatePostRequestDto,
  CreatePostResponseDto,
  MICROSERVICE_NAME,
  POSTS_PATTERNS,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { AccessTokenAuthGuard } from '../../core/guards/bearer/access-token.guard';
import { ExtractUserFromRequest } from '../../core/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '@snaptix/common/dto/user-context.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiBadRequestCustomResponse } from '../../core/swagger/bad-request.swagger';
import { ApiUnauthorizedCustomResponse } from '../../core/swagger/unauthorized.swagger';

@Controller({ path: 'posts', version: '1' })
export class PostsController {
  constructor(@Inject(MICROSERVICE_NAME.POSTS) private posts: ClientProxy) {}

  /**
   * Создание поста
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessTokenAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать пост' })
  @ApiOkResponse({ type: CreatePostResponseDto })
  @ApiBadRequestCustomResponse()
  @ApiUnauthorizedCustomResponse()
  async createPost(
    @Body() body: CreatePostRequestDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CreatePostResponseDto> {
    const result = this.posts.send<CreatePostMsResponseDto, CreatePostPayload>(
      POSTS_PATTERNS.CREATE_POST,
      {
        userId: user.userId,
        description: body.description,
        media: body.media,
      },
    );

    const post = await firstValueFrom(result);

    //TODO: убрать хардкод после реализации микросервиса files и добавить маппер
    return {
      ...post,
      media: post.media.map((m) => ({
        fileId: m.fileId,
        url: 'https://swebtoon-phinf.pstatic.net/20241203_198/1733185516062oNh7H_PNG/thumbnail.jpg',
      })),
    };
  }
}
