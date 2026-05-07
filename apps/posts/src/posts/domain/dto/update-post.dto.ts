import { IPost } from '@snaptix/common';

export type UpdatePostDto = Partial<Pick<IPost, 'description'>>;
