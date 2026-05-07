import { ApiProperty } from '@nestjs/swagger';
import { ERRORS } from '@snaptix/contracts';

class NotFoundErrorMessageType {
  @ApiProperty({
    description: 'The HTTP status code of the response',
    example: 404,
  })
  status: 404;

  @ApiProperty({
    description: 'The error code expressed as a string value',
    example: ERRORS.EMAIL_CONFIRMATION_CODE_NOT_FOUND.code,
    enum: Object.values(ERRORS)
      .filter((error) => error.httpCode === 404)
      .map((error) => error.code),
  })
  code: string | null;

  @ApiProperty({
    description: 'The name of the field where the error occurred',
    example: ERRORS.EMAIL_CONFIRMATION_CODE_NOT_FOUND.field,
  })
  field: string;

  @ApiProperty({
    description: 'Brief description of the problem',
    example: ERRORS.EMAIL_CONFIRMATION_CODE_NOT_FOUND.message,
  })
  message: string;
}

export class NotFoundErrorsResponseDto {
  /**
   * List of validation errors
   */
  errors: NotFoundErrorMessageType[];
}
