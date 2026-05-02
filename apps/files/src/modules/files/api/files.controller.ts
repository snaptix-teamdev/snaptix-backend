import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import {
  FILES_MICROSERVICE_PATTERNS,
  GetDownloadUrlPayload,
  GetDownloadUrlResponseDto,
  GetUploadUrlPayload,
  GetUploadUrlResponseDto,
  RevokeFileAccessPayload,
} from '@snaptix/contracts';
import { GetUploadUrlCommand } from '../application/commands/get-upload-url.usecase';
import { GetDownloadUrlCommand } from '../application/commands/get-download-url.usecase';
import { RevokeFileAccessCommand } from '../application/commands/revoke-file-access.usecase';

@Controller()
export class FilesController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(FILES_MICROSERVICE_PATTERNS.FILES.GET_UPLOAD_URL)
  async getUploadUrl(
    @Payload() payload: GetUploadUrlPayload,
  ): Promise<GetUploadUrlResponseDto> {
    return this.commandBus.execute(new GetUploadUrlCommand(payload));
  }

  @MessagePattern(FILES_MICROSERVICE_PATTERNS.FILES.GET_DOWNLOAD_URL)
  async getDownloadUrl(
    @Payload() payload: GetDownloadUrlPayload,
  ): Promise<GetDownloadUrlResponseDto> {
    return this.commandBus.execute(new GetDownloadUrlCommand(payload));
  }

  @MessagePattern(FILES_MICROSERVICE_PATTERNS.FILES.REVOKE_FILE_ACCESS)
  async revokeFileAccess(
    @Payload() payload: RevokeFileAccessPayload,
  ): Promise<object> {
    await this.commandBus.execute(new RevokeFileAccessCommand(payload));

    return {};
  }
}
