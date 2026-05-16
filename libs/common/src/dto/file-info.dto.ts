import { FileEntityType } from '@snaptix/common/interfaces';

export class FileInfoDto {
  userId: string;
  fileName: string;
  entityType: FileEntityType;
  mimeType: string;
}
