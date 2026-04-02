import { HttpStatus } from '@snaptix/common/enums';

export interface IDomainError {
  code: string;
  message: string;
  httpCode: HttpStatus;
}
