import { IDomainError } from '@snaptix/common/interfaces';
import { HttpStatus } from '@snaptix/common/enums';
import { DomainException } from './domain.exception';
import {
  BulkDomainException,
  IBulkDomainExceptionPayload,
} from './bulk-domain.exception';

export type DomainErrorPayload =
  | IDomainError<any>
  | IBulkDomainExceptionPayload;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSingleDomainErrorPayload(
  value: unknown,
): value is IDomainError<any> {
  return (
    isObject(value) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string' &&
    typeof value.httpCode === 'number'
  );
}

function isBulkDomainErrorPayload(
  value: unknown,
): value is IBulkDomainExceptionPayload {
  return (
    isObject(value) &&
    value.isBulk === true &&
    Array.isArray(value.errors) &&
    value.errors.every(
      (item) =>
        isObject(item) &&
        typeof item.itemId === 'string' &&
        isSingleDomainErrorPayload(item.error),
    )
  );
}

export function isDomainErrorPayload(
  value: unknown,
): value is DomainErrorPayload {
  return isBulkDomainErrorPayload(value) || isSingleDomainErrorPayload(value);
}

export function getDomainErrorPayload(
  exception: unknown,
): DomainErrorPayload | null {
  if (
    exception instanceof DomainException ||
    exception instanceof BulkDomainException
  ) {
    const error = exception.getError();
    return isDomainErrorPayload(error) ? error : null;
  }

  return isDomainErrorPayload(exception) ? exception : null;
}

export function toDomainException(
  payload: DomainErrorPayload,
): DomainException | BulkDomainException {
  return isBulkDomainErrorPayload(payload)
    ? new BulkDomainException(payload.errors)
    : new DomainException(payload);
}

export function getDomainErrorHttpStatus(
  payload: DomainErrorPayload,
): HttpStatus {
  return isBulkDomainErrorPayload(payload)
    ? HttpStatus.CONFLICT
    : payload.httpCode;
}
