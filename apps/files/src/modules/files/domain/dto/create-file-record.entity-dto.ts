import { IFileRecord } from '@snaptix/common';

export type CreateFileRecordEntityDto = Pick<
  IFileRecord,
  'userId' | 'storageKey' | 'fileName' | 'mimeType'
>;
