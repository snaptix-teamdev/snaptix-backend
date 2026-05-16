import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { S3Config, S3Provider } from './s3.config';

@Injectable()
export class MinioSetupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MinioSetupService.name);
  private readonly s3Client: S3Client;

  constructor(private readonly s3Config: S3Config) {
    this.s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.keyId,
        secretAccessKey: s3Config.secretKey,
      },
      forcePathStyle: true,
    });
  }

  async onApplicationBootstrap(): Promise<void> {
    if (this.s3Config.provider !== S3Provider.MINIO) {
      this.logger.log(
        'S3 provider is not MinIO — skipping auto-setup. Configure buckets and event notifications manually in S3 console.',
      );
      return;
    }

    try {
      await this.ensureBucket(this.s3Config.tmpBucket);
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
}
