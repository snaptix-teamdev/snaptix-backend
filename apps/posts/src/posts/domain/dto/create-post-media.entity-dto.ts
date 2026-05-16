import { IPostMedia } from '@snaptix/common';

export type CreatePostMediaEntityDto = Pick<
  IPostMedia,
  'fileId' | 'storageKey' | 'order'
>;
