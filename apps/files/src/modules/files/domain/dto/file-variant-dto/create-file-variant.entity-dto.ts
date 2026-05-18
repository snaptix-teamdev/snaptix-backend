import { IFileVariant } from '@snaptix/common';

export type CreateFileVariantEntityDto = Pick<
  IFileVariant,
  'originalFileId' | 'width' | 'height' | 'storageKey'
>;
