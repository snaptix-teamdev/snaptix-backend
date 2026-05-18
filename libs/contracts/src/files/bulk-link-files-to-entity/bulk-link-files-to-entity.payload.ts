import { FileEntityType } from '@snaptix/common';

export class BulkLinkFilesToEntityPayload {
  entityId: string;
  entityType: FileEntityType;
  fileIds: string[];
  userId: string;
}
