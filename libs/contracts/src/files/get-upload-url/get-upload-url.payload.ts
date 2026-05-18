import { FileEntityType } from '@snaptix/common';

export class GetUploadUrlPayload {
  userId: string;
  fileName: string;
  mimeType: string;
  contentLengthBytes: number;
  fileEntityType: FileEntityType;
}
