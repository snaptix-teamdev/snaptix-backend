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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  FILES_MICROSERVICE_PATTERNS,
  GetDownloadUrlPayload,
  GetDownloadUrlResponseDto,
  GetUploadUrlPayload,
  GetUploadUrlRequestDto,
  GetUploadUrlResponseDto,
  MICROSERVICE_NAME,
  RevokeFileAccessPayload,
} from '@snaptix/contracts';
import { firstValueFrom } from 'rxjs';
import { AccessTokenAuthGuard } from '../../../core/guards/bearer/access-token.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '@snaptix/common/dto/user-context.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ApiUnauthorizedCustomResponse } from '../../../core/swagger/unauthorized.swagger';
import { ApiNotFoundCustomResponse } from '../../../core/swagger/not-found.swagger';
import { ApiForbiddenCustomResponse } from '../../../core/swagger/forbidden.swagger';
import * as Busboy from 'busboy';
import { request as undiciRequest } from 'undici';
import { IncomingMessage } from 'http';
import { Transform } from 'stream';
import type { Response } from 'express';
import { IDomainError } from '@snaptix/common';
import { COMMON_ERRORS } from '@snaptix/contracts';
import { CoreConfig } from '../../../core/config/core.config';
import { SampleDto } from './sample.request-dto';

@Controller({ path: 'files', version: '1' })
@UseGuards(AccessTokenAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedCustomResponse()
export class FilesController {
  constructor(
    @Inject(MICROSERVICE_NAME.FILES) private filesClient: ClientProxy,
    private readonly coreConfig: CoreConfig,
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

  /**
   * Загрузить файл потоком через микросервис files
   */
  @Post('upload-stream')
  @ApiBody({ type: SampleDto })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Файл загружен успешно' })
  async uploadStream(
    @Req() req: IncomingMessage,
    @Res() res: Response,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await new Promise<void>((resolve) => {
      const busboy = Busboy({
        headers: req.headers as Record<string, string>,
        limits: { files: 1 },
      });

      let gatewayBytesReceived = 0;
      req.on('data', (chunk: Buffer) => {
        gatewayBytesReceived += chunk.length;
        process.stdout.write(
          `\r[gateway] received from client: ${(gatewayBytesReceived / 1024 / 1024).toFixed(2)} MB`,
        );
      });
      req.once('end', () =>
        process.stdout.write(
          `\r[gateway] client stream ended at: ${(gatewayBytesReceived / 1024 / 1024).toFixed(2)} MB\n`,
        ),
      );
      // Suppress ECONNRESET: client may send TCP RST when it aborts its upload
      // upon receiving an early error response.
      req.on('error', () => {});

      let done = false;
      let fileReceived = false;

      // Sends the error response and drains the remaining client upload.
      // Draining is required so the client's TCP send window never hits zero:
      // if we stop reading, the window drops to 0, the client cannot send its
      // FIN, and fetch() sees a connection abort instead of the 422/413 body.
      // The data is read and discarded — it never reaches the files service.
      const sendError = (error: IDomainError): void => {
        if (done) return;
        done = true;
        res.status(error.httpCode).json({
          errors: [
            {
              status: error.httpCode,
              code: error.code,
              field: error.field,
              message: error.message,
            },
          ],
        });
        req.unpipe();
        req.resume();
        resolve();
      };

      busboy.on('file', (_field, fileStream, info) => {
        fileReceived = true;
        const { filename, mimeType } = info;

        // Count bytes INSIDE the pipe chain via a Transform so that fileStream
        // itself never gets a 'data' listener. A direct on('data') would put
        // fileStream into flowing mode, conflicting with undici's pull-based
        // read() and causing it to receive an empty body.
        let gatewayBytesSent = 0;
        const byteCounter = new Transform({
          transform(chunk: Buffer, _enc, cb) {
            gatewayBytesSent += chunk.length;
            process.stdout.write(
              `\r[gateway] sent to files: ${(gatewayBytesSent / 1024 / 1024).toFixed(2)} MB`,
            );
            cb(null, chunk);
          },
          flush(cb) {
            process.stdout.write(
              `\r[gateway] fileStream ended at: ${(gatewayBytesSent / 1024 / 1024).toFixed(2)} MB\n`,
            );
            cb();
          },
        });
        fileStream.pipe(byteCounter);
        // Suppress errors emitted when undici destroys this stream upon receiving
        // an early error response from files (Connection: close closes the socket
        // before the body is fully sent — same pattern as validationStream in files).
        byteCounter.on('error', () => {});

        undiciRequest(
          `${this.coreConfig.filesHttpUrl}/internal/upload-stream`,
          {
            method: 'POST',
            headers: {
              'content-type': 'application/octet-stream',
              'x-user-id': user.userId,
              'x-file-name': encodeURIComponent(filename),
              'x-mime-type': mimeType,
            },
            body: byteCounter,
          },
        )
          .then(async ({ statusCode, body }) => {
            const data = (await body.json()) as {
              fileId?: string;
              errors?: Array<IDomainError & { status?: number }>;
            };
            if (statusCode >= 400) {
              const apiError = data.errors?.[0];
              const domainError: IDomainError = apiError
                ? {
                    ...apiError,
                    httpCode: apiError.httpCode ?? apiError.status ?? 500,
                  }
                : COMMON_ERRORS.INTERNAL_ERROR;
              sendError(domainError);
              return;
            }
            if (done) return;
            done = true;
            res.status(200).json(data);
            resolve();
          })
          .catch(() => sendError(COMMON_ERRORS.INTERNAL_ERROR));
      });

      busboy.on('error', () => sendError(COMMON_ERRORS.INTERNAL_ERROR));
      busboy.on('finish', () => {
        // Only fire if no file was present in the request at all.
        // For normal uploads busboy finishes BEFORE undici resolves (client
        // finishes uploading while files is still processing), so checking
        // fileReceived prevents a false INTERNAL_ERROR on successful uploads.
        if (!done && !fileReceived) sendError(COMMON_ERRORS.INTERNAL_ERROR);
      });
      req.pipe(busboy);
    });
  }
}
