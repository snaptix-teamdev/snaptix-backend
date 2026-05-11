import { Transform, TransformCallback } from 'stream';
import { filetypemime } from 'magic-bytes.js';

const HEADER_BYTES_NEEDED = 12;

export const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png'];

export class FileTooLargeError extends Error {
  constructor(maxBytes: number) {
    super(`File size exceeds the maximum allowed size of ${maxBytes} bytes`);
    this.name = 'FileTooLargeError';
  }
}

export class InvalidFileTypeError extends Error {
  constructor() {
    super('File content does not match any supported MIME type');
    this.name = 'InvalidFileTypeError';
  }
}

export class FileValidationStream extends Transform {
  bytesTotal = 0;
  detectedMimeType: string | null = null;
  // the correct ContentType in the multipart-upload initiation request.
  readonly detection: Promise<string>;
  private headerBuffer = Buffer.alloc(0);

  // Resolves with the detected MIME type as soon as the magic bytes are read.
  // The use case awaits this before calling putObjectStream so S3 receives
  private headerValidated = false;
  private _detectionResolve: (mime: string) => void;
  private _detectionReject: (err: Error) => void;

  constructor(private readonly maxSizeBytes: number) {
    super();
    this.detection = new Promise<string>((resolve, reject) => {
      this._detectionResolve = resolve;
      this._detectionReject = reject;
    });
  }

  _transform(chunk: Buffer, _enc: string, cb: TransformCallback): void {
    this.bytesTotal += chunk.length;
    console.log(chunk);
    if (this.bytesTotal > this.maxSizeBytes) {
      const err = new FileTooLargeError(this.maxSizeBytes);
      this._detectionReject(err);
      cb(err);
      return;
    }

    if (!this.headerValidated) {
      this.headerBuffer = Buffer.concat([this.headerBuffer, chunk]);

      if (this.headerBuffer.length >= HEADER_BYTES_NEEDED) {
        const err = this.detectMimeType();
        if (err) {
          this._detectionReject(err);
          cb(err);
          return;
        }
        this.headerValidated = true;
        this.push(this.headerBuffer);
        cb();
      } else {
        cb();
      }
      return;
    }

    this.push(chunk);
    cb();
  }

  _flush(cb: TransformCallback): void {
    if (!this.headerValidated) {
      if (this.headerBuffer.length === 0) {
        const err = new InvalidFileTypeError();
        this._detectionReject(err);
        cb(err);
        return;
      }
      const err = this.detectMimeType();
      if (err) {
        this._detectionReject(err);
        cb(err);
        return;
      }
      this.push(this.headerBuffer);
    }
    cb();
  }

  private detectMimeType(): InvalidFileTypeError | null {
    const mimeType = filetypemime(this.headerBuffer)[0] ?? null;

    if (SUPPORTED_MIME_TYPES.includes(mimeType)) {
      this.detectedMimeType = mimeType;
      this._detectionResolve(mimeType);
      console.log({ detectedMimeType: mimeType });

      return null;
    }

    console.log({ mimeTypeNotSupported: mimeType });

    return new InvalidFileTypeError();
  }
}
