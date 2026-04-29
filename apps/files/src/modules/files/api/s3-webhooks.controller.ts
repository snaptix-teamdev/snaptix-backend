import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { S3WebhookGuard } from './guards/s3-webhook.guard';
import { ProcessTmpUploadCommand } from '../application/commands/process-tmp-upload.usecase';
import { ProcessMainUploadCommand } from '../application/commands/process-main-upload.usecase';

interface MinioEventBody {
  Records: Array<{
    s3: {
      object: {
        key: string;
        size: number;
      };
    };
  }>;
}

@Controller('webhooks/s3')
@UseGuards(S3WebhookGuard)
export class S3WebhooksController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('tmp-uploaded')
  @HttpCode(200)
  async tmpUploaded(@Body() body: MinioEventBody): Promise<void> {
    const record = body.Records?.[0];
    if (!record) return;

    const storageKey = decodeURIComponent(record.s3.object.key);
    const fileSize = record.s3.object.size;

    await this.commandBus.execute(
      new ProcessTmpUploadCommand({ storageKey, fileSize }),
    );
  }

  @Post('main-uploaded')
  @HttpCode(200)
  async mainUploaded(@Body() body: MinioEventBody): Promise<void> {
    const record = body.Records?.[0];
    if (!record) return;

    const storageKey = decodeURIComponent(record.s3.object.key);

    await this.commandBus.execute(new ProcessMainUploadCommand({ storageKey }));
  }
}
