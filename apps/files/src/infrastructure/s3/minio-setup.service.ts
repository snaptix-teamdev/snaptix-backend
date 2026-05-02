import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketNotificationConfigurationCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { S3Config, S3Provider } from './s3.config';

const TMP_WEBHOOK_ARN = 'arn:minio:sqs::tmp:webhook';
const MAIN_WEBHOOK_ARN = 'arn:minio:sqs::main:webhook';

@Injectable()
export class MinioSetupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MinioSetupService.name);
  private readonly s3Client: S3Client;

  constructor(private readonly s3Config: S3Config) {
    this.s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKey,
        secretAccessKey: s3Config.secretKey,
      },
      forcePathStyle: true,
    });
  }

  async onApplicationBootstrap(): Promise<void> {
    if (this.s3Config.provider !== S3Provider.MINIO) {
      this.logger.log(
        'S3 provider is not MinIO — skipping auto-setup. Configure buckets and event notifications manually in Yandex Cloud console.',
      );
      return;
    }

    try {
      await this.ensureBucket(this.s3Config.tmpBucket);
      await this.ensureBucket(this.s3Config.mainBucket);
      await this.setupNotifications();
    } catch (err) {
      this.logger.error('MinIO setup failed', err);
    }
  }

  private async ensureBucket(name: string): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: name }));
      this.logger.log(`Bucket exists: ${name}`);
    } catch {
      await this.s3Client.send(new CreateBucketCommand({ Bucket: name }));
      this.logger.log(`Bucket created: ${name}`);
    }
  }

  private async setupNotifications(): Promise<void> {
    this.logger.log(
      `Setting up notifications. TMP ARN: ${TMP_WEBHOOK_ARN}, MAIN ARN: ${MAIN_WEBHOOK_ARN}`,
    );

    await this.s3Client.send(
      new PutBucketNotificationConfigurationCommand({
        Bucket: this.s3Config.tmpBucket,
        NotificationConfiguration: {
          QueueConfigurations: [
            {
              QueueArn: TMP_WEBHOOK_ARN,
              Events: ['s3:ObjectCreated:Put'],
            },
          ],
        },
      }),
    );

    await this.s3Client.send(
      new PutBucketNotificationConfigurationCommand({
        Bucket: this.s3Config.mainBucket,
        NotificationConfiguration: {
          QueueConfigurations: [
            {
              QueueArn: MAIN_WEBHOOK_ARN,
              Events: ['s3:ObjectCreated:*'],
            },
          ],
        },
      }),
    );

    this.logger.log('MinIO bucket notifications configured');
  }
}
