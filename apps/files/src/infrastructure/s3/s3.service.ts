import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Config } from './s3.config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
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

  async getPresignedUploadUrl(storageKey: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.s3Config.bucket,
      Key: storageKey,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: this.s3Config.presignedUploadTtlSeconds,
    });
  }

  async getPresignedDownloadUrl(storageKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.s3Config.bucket,
      Key: storageKey,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: this.s3Config.presignedDownloadTtlSeconds,
    });
  }
}
