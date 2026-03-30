import { IError } from '@snaptix/common/interfaces';
import { RpcException } from '@nestjs/microservices';

export class DomainException extends RpcException {
  public code: string;
  public httpCode: number;

  constructor(exception: IError) {
    super(exception);
    this.name = DomainException.name;
  }
}
