import { FileEntityType } from '@snaptix/common';

export class LinkFileToEntityPayload {
  entityId: string;
  entityType: FileEntityType;
  fileId: string;
  userId: string;
}
