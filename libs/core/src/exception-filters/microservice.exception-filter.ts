import { Catch, Logger, RpcExceptionFilter } from '@nestjs/common';
import { DomainException, IDomainError } from '@snaptix/common';
import { Observable, throwError } from 'rxjs';
import { COMMON_ERRORS } from '@snaptix/contracts';
import { RpcException } from '@nestjs/microservices';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch()
export class MicroserviceExceptionFilter implements RpcExceptionFilter<RpcException> {
  private logger = new Logger(MicroserviceExceptionFilter.name);

  catch(
    exception: DomainException | Error | ZodValidationException,
  ): Observable<IDomainError> {
    if (exception instanceof DomainException) {
      this.logger.error(exception.getError());
      return throwError(() => exception.getError());
    }

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as ZodError;
      this.logger.error(zodError.issues);
      //TODO: добавить маппинг
      return throwError(() => COMMON_ERRORS.VALIDATION_ERROR);
    }

    this.logger.error(exception, COMMON_ERRORS.INTERNAL_ERROR);

    return throwError(() => COMMON_ERRORS.INTERNAL_ERROR);
  }
}
