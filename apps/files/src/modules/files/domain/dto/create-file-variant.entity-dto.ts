import { IFileVariant } from '@snaptix/common';

export type CreateFileVariantEntityDto = Pick<
  IFileVariant,
  'fileRecordId' | 'width' | 'height' | 'storageKey'
>;
