import { HttpStatus } from '@snaptix/common/enums';

export interface IError {
  code: string;
  message: string;
  httpCode: HttpStatus;
}
