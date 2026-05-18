import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from '../../../infrastructure/s3/s3.service';
import { filetypemime, filetypename } from 'magic-bytes.js';

const HEADER_BYTES_NEEDED = 256;
export const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png'];

type MimeValidationResult =
  | { status: 'valid'; detectedMimeType: string; ext: string }
  | { status: 'invalid'; detectedMimeType: string }
  | { status: 'fileNotUploaded' };

@Injectable()
export class FileValidationService {
  private logger = new Logger(FileValidationService.name);

  constructor(private s3Service: S3Service) {}

  /**
   * @param storageKey - S3 storage key of the file to validate
   * @param supportedMimeTypes - list of allowed MIME types (e.g. `['image/jpeg', 'image/png']`)
   * @returns `valid` — file exists, MIME type is allowed; includes `detectedMimeType` and `ext`;
   *          `invalid` — file exists but MIME type is not in `supportedMimeTypes`; includes `detectedMimeType`;
   *          `file_not_uploaded` — file does not yet exist in S3
   */
  async validateMimeType(
    storageKey: string,
    supportedMimeTypes: string[],
  ): Promise<MimeValidationResult> {
    const fileBuffer = await this.s3Service.getObjectBufferLength(
      storageKey,
      HEADER_BYTES_NEEDED,
    );

    if (!fileBuffer) {
      this.logger.debug({ message: 'File not uploaded', data: fileBuffer });
      return { status: 'fileNotUploaded' };
    }

    const detectedMimeType = filetypemime(fileBuffer)[0] ?? null;

    const isMimeTypeSupported = supportedMimeTypes.includes(detectedMimeType);

    if (!detectedMimeType || !isMimeTypeSupported) {
      this.logger.debug({ detectedMimeType, isMimeTypeSupported });
      return { status: 'invalid', detectedMimeType };
    }

    const ext = filetypename(fileBuffer)[0];

    return { status: 'valid', detectedMimeType, ext };
  }
}
