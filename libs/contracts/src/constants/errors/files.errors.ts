import { IDomainError, IFile } from '@snaptix/common';

export const FILES_ERRORS = {
  FILE_NOT_FOUND: {
    code: 'FILE_NOT_FOUND',
    message: 'File with current id not found',
    httpCode: 404,
    field: null,
  },
  FILE_MIME_TYPE_NOT_SUPPORTED: {
    code: 'FILE_MIME_TYPE_NOT_SUPPORTED',
    message: 'File mime type is not supported',
    httpCode: 409,
    field: null,
  },
  FILE_NOT_UPLOADED: {
    code: 'FILE_NOT_UPLOADED',
    message: 'File has not been uploaded yet',
    httpCode: 409,
    field: null,
  },
  FILE_NOT_READY: {
    code: 'FILE_NOT_READY',
    message: 'File is not ready for download yet',
    httpCode: 409,
    field: null,
  },
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    message: 'File size exceeds the maximum allowed size',
    httpCode: 413,
    field: null,
  },
  INVALID_FILE_TYPE: {
    code: 'INVALID_FILE_TYPE',
    message: 'File content does not match the declared MIME type',
    httpCode: 422,
    field: null,
  },
  FILE_ALREADY_CONFIRMED: {
    code: 'FILE_ALREADY_CONFIRMED',
    message: 'File already confirmed',
    httpCode: 409,
    field: null,
  },
  FILE_NOT_CONFIRMED: {
    code: 'FILE_NOT_CONFIRMED',
    message: 'File not confirmed',
    httpCode: 409,
    field: null,
  },
  FILE_NOT_BELONG_ENTITY: {
    code: 'FILE_NOT_BELONG_ENTITY',
    message: 'The file does not belong to this entity',
    httpCode: 403,
    field: null,
  },
  FILE_NOT_BELONG_USER: {
    code: 'FILE_NOT_BELONG_USER',
    message: 'The file does not belong to this user',
    httpCode: 403,
    field: null,
  },
  FILE_LINKED_TO_OTHER_ENTITY: {
    code: 'FILE_LINKED_TO_OTHER_ENTITY',
    message: 'The file is linked to another entity',
    httpCode: 409,
    field: null,
  },
} satisfies Record<string, IDomainError<IFile>>;
