import { IDomainError } from '@snaptix/common';

export const COMMON_ERRORS = {
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    httpCode: 400,
    field: null,
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    httpCode: 500,
    field: null,
  },
  CONFLICT_ERROR: {
    code: 'CONFLICT_ERROR',
    message: 'Conflict',
    httpCode: 409,
    field: null,
  },
  UNAUTHORIZED_ERROR: {
    code: 'UNAUTHORIZED_ERROR',
    message: 'Unauthorized',
    httpCode: 401,
    field: null,
  },
} satisfies Record<string, IDomainError>;
