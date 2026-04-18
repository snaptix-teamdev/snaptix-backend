import { HttpStatus } from '@snaptix/common/enums';

export interface IDomainError<T = null> {
  code: string;
  message: string;
  httpCode: HttpStatus;
  field: T extends null ? null : keyof T | null;
}
