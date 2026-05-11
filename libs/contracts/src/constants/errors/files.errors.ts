import { IDomainError } from '@snaptix/common';
import { IFileRecord } from '@snaptix/common';

export const FILES_ERRORS = {
  FILE_NOT_FOUND: {
    code: 'FILE_NOT_FOUND',
    message: 'File not found',
    httpCode: 404,
    field: 'id',
  },
  FILE_ACCESS_REVOKED: {
    code: 'FILE_ACCESS_REVOKED',
    message: 'File access has been revoked',
    httpCode: 403,
    field: 'id',
  },
  FILE_ACCESS_FORBIDDEN: {
    code: 'FILE_ACCESS_FORBIDDEN',
    message: 'You do not have permission to perform this action on the file',
    httpCode: 403,
    field: 'id',
  },
  FILE_NOT_READY: {
    code: 'FILE_NOT_READY',
    message: 'File is not ready for download yet',
    httpCode: 409,
    field: 'id',
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
} satisfies Record<string, IDomainError<IFileRecord>>;
