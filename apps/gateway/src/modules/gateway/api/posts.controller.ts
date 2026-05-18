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
  ConfirmUploadFilePayload,
  CreatePostMsResponseDto,
  CreatePostPayload,
  CreatePostRequestDto,
  CreatePostResponseDto,
  FILES_MICROSERVICE_PATTERNS,
  GetPostByIdMsResponseDto,
  GetPostByIdPayload,
  GetPostByIdResponseDto,
  GetUploadUrlPayload,
  GetUploadUrlRequestDto,
  GetUploadUrlResponseDto,
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
import { FileEntityType } from '@snaptix/common';
import { GatewayConfig } from '../gateway.config';
import { PostViewDto } from './mappers/post.mapper';
import { ApiUnprocessableEntityCustomResponse } from '../../../core/swagger/unprocessable-entity.swagger';

@Controller({ path: 'posts', version: '1' })
export class PostsController {
  constructor(
    @Inject(MICROSERVICE_NAME.POSTS) private posts: ClientProxy,
    @Inject(MICROSERVICE_NAME.FILES) private files: ClientProxy,
    private postsConfig: GatewayConfig,
  ) {}

  /**
   * Создание поста
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessTokenAuthGuard)
  @ApiOperation({
    description: `
      Шаги создания поста:
      \n1. Получить \`presignedUrl\` и \`fileId\` (photo/get-upload-url)
      \n2. После загрузки юзером фото - подтвердите (photo/:photoId/confirm) загрузку передав \`fileId\` из шага 1
      \n3. Добавьте \`fileId\` в массив \`media\`
      `,
  })
  @ApiBearerAuth()
  @ApiBadRequestCustomResponse()
  @ApiUnauthorizedCustomResponse()
  @ApiUnprocessableEntityCustomResponse()
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

    return new PostViewDto(post, this.postsConfig.filesStorageBaseUrl);
  }

  /**
   * Получить presignedUrl для загрузки фото поста
   */
  @Post('photo/get-upload-url')
  @UseGuards(AccessTokenAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    description: `
      Шаги загрузки фото:
      \n1. Извлечь необходимые данные из файла и получить \`url\` и \`fileId\`
      \n2. Загрузить файл отправив PUT запрос на url
      `,
  })
  @ApiBadRequestCustomResponse()
  @ApiUnauthorizedCustomResponse()
  getUploadPhotoUrl(
    @Body() body: GetUploadUrlRequestDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GetUploadUrlResponseDto> {
    const result = this.files.send<
      GetUploadUrlResponseDto,
      GetUploadUrlPayload
    >(FILES_MICROSERVICE_PATTERNS.FILES.GET_UPLOAD_URL, {
      userId: user.userId,
      fileName: body.fileName,
      contentLengthBytes: body.contentLengthBytes,
      mimeType: body.mimeType,
      fileEntityType: FileEntityType.POST_PHOTO,
    });

    return firstValueFrom(result);
  }

  /**
   * Подтвердить загрузку фото поста
   */
  @Post(`photo/:photoId/confirm`)
  @UseGuards(AccessTokenAuthGuard)
  @ApiBearerAuth()
  @ApiNotFoundCustomResponse()
  @ApiBadRequestCustomResponse()
  @ApiUnauthorizedCustomResponse()
  async confirmUploadPhoto(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('photoId', UUIDValidationOrNotFoundPipe) photoId: string,
  ): Promise<void> {
    const result = this.files.send<void, ConfirmUploadFilePayload>(
      FILES_MICROSERVICE_PATTERNS.FILES.CONFIRM_UPLOAD_FILE,
      {
        userId: user.userId,
        fileId: photoId,
      },
    );

    await firstValueFrom(result);
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

    return new PostViewDto(post, this.postsConfig.filesStorageBaseUrl);
  }
}
