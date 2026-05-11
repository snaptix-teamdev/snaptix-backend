import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Config } from './s3.config';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

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

  async getPresignedUploadPost(
    storageKey: string,
  ): Promise<{ url: string; fields: Record<string, string> }> {
    return createPresignedPost(this.s3Client, {
      Bucket: this.s3Config.tmpBucket,
      Key: storageKey,
      Expires: this.s3Config.presignedUploadTtlSeconds,
      Conditions: [
        ['content-length-range', 1, this.s3Config.maxUploadSizeBytes],
      ],
    });
  }

  async getPresignedDownloadUrl(storageKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.s3Config.mainBucket,
      Key: storageKey,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: this.s3Config.presignedDownloadTtlSeconds,
    });
  }

  async copyToMain(storageKey: string): Promise<void> {
    const command = new CopyObjectCommand({
      Bucket: this.s3Config.mainBucket,
      CopySource: `${this.s3Config.tmpBucket}/${storageKey}`,
      Key: storageKey,
    });

    await this.s3Client.send(command);
  }

  async deleteFromTmp(storageKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.s3Config.tmpBucket,
      Key: storageKey,
    });

    await this.s3Client.send(command);
  }

  async getObjectBuffer(storageKey: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.s3Config.mainBucket,
      Key: storageKey,
    });

    const response = await this.s3Client.send(command);
    const chunks: Uint8Array[] = [];

    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  async putObject(
    storageKey: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.s3Config.mainBucket,
      Key: storageKey,
      Body: body,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
  }

  async putObjectStream(
    storageKey: string,
    body: Readable,
    contentType: string,
  ): Promise<void> {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.s3Config.mainBucket,
        Key: storageKey,
        Body: body,
        ContentType: contentType,
      },
    });

    await upload.done();
  }
}
