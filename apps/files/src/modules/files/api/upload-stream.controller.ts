import { Controller, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { IncomingMessage } from 'http';
import type { Response } from 'express';
import { DomainException, IDomainError } from '@snaptix/common';
import { COMMON_ERRORS } from '@snaptix/contracts';
import { StreamUploadCommand } from '../application/commands/stream-upload.usecase';
import { StreamUploadResponseDto } from '@snaptix/contracts';

@Controller('internal')
export class UploadStreamController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('upload-stream')
  async uploadStream(
    @Req() req: IncomingMessage,
    @Res() res: Response,
  ): Promise<void> {
    const userId = req.headers['x-user-id'] as string;
    const fileName = decodeURIComponent(req.headers['x-file-name'] as string);
    const mimeType = req.headers['x-mime-type'] as string;

    try {
      const result: StreamUploadResponseDto = await this.commandBus.execute(
        new StreamUploadCommand({ userId, fileName, mimeType, stream: req }),
      );
      res.status(200).json(result);
    } catch (err) {
      const error: IDomainError =
        err instanceof DomainException
          ? (err.getError() as IDomainError)
          : COMMON_ERRORS.INTERNAL_ERROR;

      // Connection: close instructs undici (gateway side) to stop sending the
      // request body and close the socket once this response is delivered.
      // This prevents the remaining file bytes from travelling gateway → files.
      res.set('Connection', 'close');
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
    }
  }
}
