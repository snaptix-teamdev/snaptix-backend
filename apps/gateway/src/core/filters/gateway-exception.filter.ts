import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { IDomainError } from '@snaptix/common';
import { COMMON_ERRORS, ERRORS } from '@snaptix/contracts';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

function isDomainException(exception: unknown): exception is IDomainError {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    (exception as IDomainError).code in ERRORS
  );
}

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter<HttpException> {
  private logger = new Logger(GatewayExceptionFilter.name);

  catch(
    exception: HttpException | IDomainError | Error | ZodValidationException,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ZodValidationException) {
      const exceptionResponse = exception.getResponse();
      this.logger.debug({
        type: 'ZodValidationException',
        ...(typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : exceptionResponse),
      });

      const zodError = exception.getZodError() as ZodError;
      const errors = zodError.issues.map((error) => {
        return {
          field: error.path[0],
          code: error.code,
          message: error.message,
        };
      });

      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        error: COMMON_ERRORS.VALIDATION_ERROR.code,
        message: exception.message,
        errors,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      this.logger.debug({
        type: 'HttpException',
        ...(typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : exceptionResponse),
      });

      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        error: HttpStatus[exception.getStatus()],
        message: exception.message,
      });
      return;
    }

    if (isDomainException(exception)) {
      this.logger.error({ type: 'DomainException', exception });

      response.status(exception.httpCode).json({
        statusCode: exception.httpCode,
        error: exception.code,
        message: exception.message,
      });
      return;
    }

    this.logger.error(exception);
    const internalException = COMMON_ERRORS.INTERNAL_ERROR;
    response.status(internalException.httpCode).json({
      statusCode: internalException.httpCode,
      error: internalException.code,
      message: internalException.message,
    });
  }
}
