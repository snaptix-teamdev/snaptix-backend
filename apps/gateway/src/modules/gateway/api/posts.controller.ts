import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreatePostMsResponseDto,
  CreatePostPayload,
  CreatePostRequestDto,
  CreatePostResponseDto,
  GetPostByIdMsResponseDto,
  GetPostByIdPayload,
  GetPostByIdResponseDto,
  MICROSERVICE_NAME,
  POSTS_PATTERNS,
  UpdatePostMsResponseDto,
  UpdatePostPayload,
  UpdatePostRequestDto,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { AccessTokenAuthGuard } from '../../../core/guards/bearer/access-token.guard';
import { AccessTokenOptionalAuthGuard } from '../../../core/guards/bearer/access-token-optional-auth.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '@snaptix/common/dto/user-context.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiBadRequestCustomResponse } from '../../../core/swagger/bad-request.swagger';
import { ApiUnauthorizedCustomResponse } from '../../../core/swagger/unauthorized.swagger';
import { ApiNotFoundCustomResponse } from '../../../core/swagger/not-found.swagger';
import { ApiForbiddenCustomResponse } from '../../../core/swagger/forbidden.swagger';
import { UUIDValidationOrNotFoundPipe } from '../../../core/pipes/uuid-validation.pipe';

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

  /**
   * Редактирование поста
   */
  @Patch(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessTokenAuthGuard)
  @ApiBearerAuth()
  @ApiBadRequestCustomResponse()
  @ApiUnauthorizedCustomResponse()
  @ApiForbiddenCustomResponse()
  @ApiNotFoundCustomResponse()
  async updatePost(
    @Param('postId', UUIDValidationOrNotFoundPipe) postId: string,
    @Body() body: UpdatePostRequestDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    const result = this.posts.send<UpdatePostMsResponseDto, UpdatePostPayload>(
      POSTS_PATTERNS.UPDATE_POST,
      { postId, userId: user.userId, description: body.description },
    );

    await firstValueFrom(result);
  }

  /**
   * Получение поста по id
   */
  @Get(':postId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenOptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description:
      'Авторизация опциональная. Т.е. запрос можно делать как авторизованному, так и неавторизованному юзеру',
  })
  @ApiOkResponse({ type: GetPostByIdResponseDto })
  @ApiBadRequestCustomResponse()
  @ApiNotFoundCustomResponse()
  async getPostById(
    @Param('postId', UUIDValidationOrNotFoundPipe) postId: string,
  ): Promise<GetPostByIdResponseDto> {
    const result = this.posts.send<
      GetPostByIdMsResponseDto,
      GetPostByIdPayload
    >(POSTS_PATTERNS.GET_POST_BY_ID, { id: postId });

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
