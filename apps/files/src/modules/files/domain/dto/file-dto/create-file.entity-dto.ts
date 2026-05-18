import { IFile } from '@snaptix/common';

export type CreateFileEntityDto = Pick<
  IFile,
  | 'ownerId'
  | 'storageKey'
  | 'fileName'
  | 'mimeType'
  | 'entityType'
  | 'status'
  | 'byteSize'
>;
