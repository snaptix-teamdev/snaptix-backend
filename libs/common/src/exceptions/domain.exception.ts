import { IDomainError } from '@snaptix/common/interfaces';
import { RpcException } from '@nestjs/microservices';

export class DomainException extends RpcException {
  constructor(exception: IDomainError<any>) {
    super(exception);
  }

  override getError(): IDomainError<any> {
    return super.getError() as IDomainError<any>;
  }
}
