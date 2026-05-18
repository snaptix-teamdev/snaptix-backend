import { RpcException } from '@nestjs/microservices';
import { IDomainError } from '@snaptix/common/interfaces';

export interface IBulkDomainError {
  itemId: string;
  error: IDomainError<any>;
}

export interface IBulkDomainExceptionPayload {
  isBulk: true;
  errors: IBulkDomainError[];
}

export class BulkDomainException extends RpcException {
  constructor(errors: IBulkDomainError[]) {
    super({ isBulk: true, errors } satisfies IBulkDomainExceptionPayload);
  }
}
