import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import {
  BulkLinkFilesToEntityMsResponseDto,
  BulkLinkFilesToEntityPayload,
  ConfirmUploadFilePayload,
  FILES_MICROSERVICE_PATTERNS,
  GetUploadUrlPayload,
  GetUploadUrlResponseDto,
  LinkFileToEntityMsResponseDto,
  LinkFileToEntityPayload,
} from '@snaptix/contracts';
import { GetUploadUrlCommand } from '../application/commands/get-upload-url.usecase';
import { ConfirmUploadFileCommand } from '../application/commands/confirm-upload-file.use-case';
import { ConfirmUploadFileMsResponseDto } from '@snaptix/contracts/files/confirm-upload-file/confirm-upload-file.ms-response-dto';
import { LinkFileToEntityCommand } from '../application/commands/link-file-to-entity.use-case';
import { BulkLinkFilesToEntityCommand } from '../application/commands/bulk-link-files-to-entity.use-case';

@Controller()
export class FilesController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(FILES_MICROSERVICE_PATTERNS.FILES.GET_UPLOAD_URL)
  async getUploadUrl(
    @Payload() payload: GetUploadUrlPayload,
  ): Promise<GetUploadUrlResponseDto> {
    return this.commandBus.execute(new GetUploadUrlCommand(payload));
  }

  @MessagePattern(FILES_MICROSERVICE_PATTERNS.FILES.CONFIRM_UPLOAD_FILE)
  async confirmUploadFile(
    @Payload() payload: ConfirmUploadFilePayload,
  ): Promise<ConfirmUploadFileMsResponseDto> {
    await this.commandBus.execute(new ConfirmUploadFileCommand(payload));
    return {};
  }

  @MessagePattern(FILES_MICROSERVICE_PATTERNS.FILES.LINK_FILE_TO_ENTITY)
  async linkFileToEntity(
    @Payload() payload: LinkFileToEntityPayload,
  ): Promise<LinkFileToEntityMsResponseDto> {
    return this.commandBus.execute(new LinkFileToEntityCommand(payload));
  }

  @MessagePattern(FILES_MICROSERVICE_PATTERNS.FILES.BULK_LINK_FILES_TO_ENTITY)
  async bulkLinkFilesToEntity(
    @Payload() payload: BulkLinkFilesToEntityPayload,
  ): Promise<BulkLinkFilesToEntityMsResponseDto> {
    return this.commandBus.execute(new BulkLinkFilesToEntityCommand(payload));
  }
}
