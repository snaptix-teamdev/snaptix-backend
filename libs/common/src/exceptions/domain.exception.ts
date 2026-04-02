import { IDomainError } from '@snaptix/common/interfaces';
import { RpcException } from '@nestjs/microservices';

export class DomainException extends RpcException {
  constructor(exception: IDomainError) {
    super(exception);
  }
}
