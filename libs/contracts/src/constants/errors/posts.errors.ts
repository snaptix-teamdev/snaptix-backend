import { IDomainError, IPost } from '@snaptix/common';

export const POSTS_ERRORS = {
  POST_MEDIA_COUNT_INVALID: {
    code: 'POST_MEDIA_COUNT_INVALID',
    message: 'Post must have between 1 and 10 media',
    httpCode: 400,
    field: 'media',
  },
  POST_NOT_FOUND: {
    code: 'POST_NOT_FOUND',
    message: 'Post not found',
    httpCode: 404,
    field: null,
  },
} satisfies Record<string, IDomainError<IPost>>;
