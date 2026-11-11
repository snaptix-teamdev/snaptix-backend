import { HttpStatus } from '@snaptix/common/enums';
import { IDomainError } from '@snaptix/common/interfaces';
import { DomainException } from './domain.exception';
import {
  BulkDomainException,
  IBulkDomainExceptionPayload,
} from './bulk-domain.exception';
import {
  getDomainErrorHttpStatus,
  getDomainErrorPayload,
  isDomainErrorPayload,
  toDomainException,
} from './domain-error.codec';

describe('domain-error.codec', () => {
  const error: IDomainError = {
    code: 'SUBSCRIPTION_NOT_FOUND',
    message: 'Subscription not found',
    httpCode: HttpStatus.NOT_FOUND,
    field: null,
  };
  const bulk: IBulkDomainExceptionPayload = {
    isBulk: true,
    errors: [{ itemId: 'subscription-1', error }],
  };

  it('should recognize single and bulk errors by shape without the ERRORS registry', () => {
    expect(isDomainErrorPayload(error)).toBe(true);
    expect(isDomainErrorPayload(bulk)).toBe(true);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['error code string', 'SUBSCRIPTION_NOT_FOUND'],
    ['Error instance', new Error('Connection terminated unexpectedly')],
    ['object with code only', { code: 'SUBSCRIPTION_NOT_FOUND' }],
    ['Nest HttpException body', { statusCode: 404, message: 'Not Found' }],
    [
      'bulk payload with item without error',
      { isBulk: true, errors: [{ itemId: 'subscription-1' }] },
    ],
  ])('should not treat %s as domain error payload', (_case, value) => {
    expect(isDomainErrorPayload(value)).toBe(false);
  });

  it('should extract payload from DomainException and BulkDomainException', () => {
    expect(getDomainErrorPayload(new DomainException(error))).toEqual(error);
    expect(getDomainErrorPayload(new BulkDomainException(bulk.errors))).toEqual(
      bulk,
    );
  });

  it('should return plain payload received from another service as is', () => {
    const fromWire: unknown = JSON.parse(JSON.stringify(error));

    expect(getDomainErrorPayload(fromWire)).toEqual(error);
  });

  it('should return null for non-domain exceptions', () => {
    expect(
      getDomainErrorPayload(new Error('Connection terminated unexpectedly')),
    ).toBeNull();
  });

  it('should restore exception from payload', () => {
    const single = toDomainException(error);
    const multiple = toDomainException(bulk);

    expect(single).toBeInstanceOf(DomainException);
    expect(single.getError()).toEqual(error);
    expect(multiple).toBeInstanceOf(BulkDomainException);
    expect(multiple.getError()).toEqual(bulk);
  });

  it('should take HTTP status from httpCode and use 409 for bulk', () => {
    expect(getDomainErrorHttpStatus(error)).toBe(HttpStatus.NOT_FOUND);
    expect(getDomainErrorHttpStatus(bulk)).toBe(HttpStatus.CONFLICT);
  });
});
