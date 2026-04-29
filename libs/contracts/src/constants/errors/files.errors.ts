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
} satisfies Record<string, IDomainError<IFileRecord>>;
