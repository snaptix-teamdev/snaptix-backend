import { Injectable, Logger } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Config } from './s3.config';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
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

  async getPresignedUploadUrlFromTmpBucket(
    storageKey: string,
    mimeType: string,
    contentLength: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.s3Config.tmpBucket,
      Key: storageKey,
      ContentType: mimeType,
      ContentLength: contentLength,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 30 });
  }

  async copyFromTmpToMainBucket(
    tmpBucketStorageKey: string,
    mainBucketStorageKey: string,
  ): Promise<void> {
    const command = new CopyObjectCommand({
      Bucket: this.s3Config.mainBucket,
      CopySource: `${this.s3Config.tmpBucket}/${tmpBucketStorageKey}`,
      Key: mainBucketStorageKey,
    });

    await this.s3Client.send(command);
  }

  async deleteFromTmpBucket(storageKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.s3Config.tmpBucket,
      Key: storageKey,
    });

    await this.s3Client.send(command);
  }

  async getObjectBufferLength(
    storageKey: string,
    bytesLength: number,
  ): Promise<Buffer | null> {
    const command = new GetObjectCommand({
      Bucket: this.s3Config.tmpBucket,
      Key: storageKey,
      Range: `bytes=0-${bytesLength - 1}`,
    });
    let result: GetObjectCommandOutput;

    try {
      result = await this.s3Client.send(command);
    } catch (err) {
      this.logger.debug(err);
      return null;
    }

    if (!result.Body) {
      return null;
    }

    const bytes = await result.Body.transformToByteArray();

    return Buffer.from(bytes);
  }

  async tagObjectForDeletion(storageKey: string): Promise<void> {
    const command = new PutObjectTaggingCommand({
      Bucket: this.s3Config.mainBucket,
      Key: storageKey,
      Tagging: {
        TagSet: [{ Key: 'delete', Value: 'true' }],
      },
    });

    await this.s3Client.send(command);
  }

  async putObject(
    storageKey: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.s3Config.tmpBucket,
      Key: storageKey,
      Body: body,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
  }
}
