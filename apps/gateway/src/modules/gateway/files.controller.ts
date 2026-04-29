import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  FILES_MICROSERVICE_PATTERNS,
  GetDownloadUrlPayload,
  GetDownloadUrlResponseDto,
  GetUploadUrlPayload,
  GetUploadUrlResponseDto,
  MICROSERVICE_NAME,
  RevokeFileAccessPayload,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { AccessTokenAuthGuard } from '../../core/guards/bearer/access-token.guard';
import { ExtractUserFromRequest } from '../../core/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '@snaptix/common/dto/user-context.dto';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ApiUnauthorizedCustomResponse } from '../../core/swagger/unauthorized.swagger';
import { ApiNotFoundCustomResponse } from '../../core/swagger/not-found.swagger';
import { ApiForbiddenCustomResponse } from '../../core/swagger/forbidden.swagger';
import { IsNotEmpty, IsString } from 'class-validator';

class GetUploadUrlRequestDto {
  /** Имя файла */
  @IsString()
  @IsNotEmpty()
  fileName: string;

  /** MIME-тип файла */
  @IsString()
  @IsNotEmpty()
  mimeType: string;
}

@Controller({ path: 'files', version: '1' })
@UseGuards(AccessTokenAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedCustomResponse()
export class FilesController {
  constructor(
    @Inject(MICROSERVICE_NAME.FILES) private filesClient: ClientProxy,
  ) {}

  /**
   * Получить presigned URL для загрузки файла
   */
  @Post('upload-url')
  @ApiOkResponse({ description: 'Presigned URL для загрузки файла' })
  getUploadUrl(
    @Body() body: GetUploadUrlRequestDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GetUploadUrlResponseDto> {
    const payload: GetUploadUrlPayload = {
      userId: user.userId,
      fileName: body.fileName,
      mimeType: body.mimeType,
    };

    return firstValueFrom(
      this.filesClient.send(
        FILES_MICROSERVICE_PATTERNS.FILES.GET_UPLOAD_URL,
        payload,
      ),
    );
  }

  /**
   * Получить presigned URL для скачивания файла
   */
  @Get(':fileId/download-url')
  @ApiOkResponse({ description: 'Presigned URL для скачивания файла' })
  @ApiNotFoundCustomResponse()
  @ApiForbiddenCustomResponse()
  getDownloadUrl(
    @Param('fileId') fileId: string,
  ): Promise<GetDownloadUrlResponseDto> {
    const payload: GetDownloadUrlPayload = { fileId };

    return firstValueFrom(
      this.filesClient.send(
        FILES_MICROSERVICE_PATTERNS.FILES.GET_DOWNLOAD_URL,
        payload,
      ),
    );
  }

  /**
   * Отозвать доступ к файлу
   */
  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Доступ к файлу успешно отозван' })
  @ApiNotFoundCustomResponse()
  @ApiForbiddenCustomResponse()
  async revokeFileAccess(
    @Param('fileId') fileId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    const payload: RevokeFileAccessPayload = {
      fileId,
      userId: user.userId,
    };

    await firstValueFrom(
      this.filesClient.send(
        FILES_MICROSERVICE_PATTERNS.FILES.REVOKE_FILE_ACCESS,
        payload,
      ),
    );
  }
}
