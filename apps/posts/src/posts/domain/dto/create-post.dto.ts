import { IPost } from '@snaptix/common';

export type CreatePostDto = Pick<IPost, 'description' | 'media' | 'userId'>;
