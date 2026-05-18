import { IPost, IPostMedia } from '@snaptix/common';

type MediaType = Pick<IPostMedia, 'fileId' | 'storageKey'>;

export type CreatePostDto = Pick<IPost, 'id' | 'description' | 'userId'> & {
  media: MediaType[];
};
