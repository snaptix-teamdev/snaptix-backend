import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpStatus, IDomainError } from '@snaptix/common';
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
          status: HttpStatus.BAD_REQUEST,
          code: error.code,
          field: error.path[0],
          message: error.message,
        };
      });

      response.status(exception.getStatus()).json({
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
        errors: [
          {
            status: exception.getStatus(),
            code: HttpStatus[exception.getStatus()],
            field: null,
            message: exception.message,
          },
        ],
      });
      return;
    }

    if (isDomainException(exception)) {
      this.logger.error({ type: 'DomainException', exception });

      response.status(exception.httpCode).json({
        errors: [
          {
            status: exception.httpCode,
            code: exception.code,
            field: exception.field,
            message: exception.message,
          },
        ],
      });
      return;
    }

    this.logger.error({ type: 'Unknown Error', exception });
    const internalException = COMMON_ERRORS.INTERNAL_ERROR;
    response.status(internalException.httpCode).json({
      errors: [
        {
          status: internalException.httpCode,
          code: internalException.code,
          field: internalException.field,
          message: internalException.message,
        },
      ],
    });
  }
}
