import { IBulkDomainError } from '@snaptix/common';

export class BulkLinkFilesToEntityMsResponseDto {
  succeeded: { storageKey: string; fileId: string }[];
  failed: IBulkDomainError[];
}
