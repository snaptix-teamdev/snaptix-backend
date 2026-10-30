import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import {
  DomainErrorPayload,
  getDomainErrorHttpStatus,
  getDomainErrorPayload,
  HttpStatus,
} from '@snaptix/common';
import { Observable, throwError } from 'rxjs';
import { COMMON_ERRORS } from '@snaptix/contracts';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

/**
 * Single exception filter for all microservices: converts the exception to a
 * DomainErrorPayload and sends it over the transport the request came in on:
 * - http — error status + payload in the response body;
 * - rpc (TCP) — payload via throwError, as ClientProxy expects it;
 * - rmq and others — rethrows the original exception so golevelup nacks
 *   the message (an event has no sender waiting for a reply).
 */
@Catch()
export class MicroserviceExceptionFilter implements ExceptionFilter {
  private logger = new Logger(MicroserviceExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): Observable<never> | void {
    const payload = this.toPayload(exception);
    const contextType = host.getType<'http' | 'rpc' | 'rmq'>();

    if (contextType === 'http') {
      host
        .switchToHttp()
        .getResponse<Response>()
        .status(getDomainErrorHttpStatus(payload))
        .json(payload);
      return;
    }

    if (contextType === 'rpc') {
      return throwError(() => payload);
    }

    throw exception;
  }

  private toPayload(exception: unknown): DomainErrorPayload {
    const domainError = getDomainErrorPayload(exception);
    if (domainError) {
      this.logger.error(domainError);
      return domainError;
    }

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as ZodError;
      this.logger.error(zodError.issues);
      //TODO: добавить маппинг
      return COMMON_ERRORS.VALIDATION_ERROR;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      this.logger.error({ status, message: exception.message });
      return {
        code: HttpStatus[status] ?? COMMON_ERRORS.INTERNAL_ERROR.code,
        message: exception.message,
        httpCode: status,
        field: null,
      };
    }

    this.logger.error(exception, COMMON_ERRORS.INTERNAL_ERROR);
    return COMMON_ERRORS.INTERNAL_ERROR;
  }
}
