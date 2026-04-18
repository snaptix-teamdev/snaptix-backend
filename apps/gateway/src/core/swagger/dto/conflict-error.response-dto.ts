import { ApiProperty } from '@nestjs/swagger';
import { ERRORS } from '@snaptix/contracts';
import { HttpStatus } from '@nestjs/common';

class ConflictErrorMessageType {
  @ApiProperty({
    description: 'The HTTP status code of the response',
    example: HttpStatus.CONFLICT,
  })
  status: HttpStatus;

  @ApiProperty({
    description: 'The error code expressed as a string value',
    example: ERRORS.EMAIL_ALREADY_CONFIRMED.code,
    enum: Object.values(ERRORS)
      .filter((error) => error.httpCode === 409)
      .map((error) => error.code),
  })
  code: string;

  @ApiProperty({
    description: 'The name of the field where the error occurred',
    example: ERRORS.EMAIL_ALREADY_CONFIRMED.field,
  })
  field: string;

  @ApiProperty({
    description: 'Brief description of the problem',
    example: ERRORS.EMAIL_ALREADY_CONFIRMED.message,
  })
  message: string;
}

export class ConflictErrorsResponseDto {
  /**
   * List of validation errors
   */
  errors: ConflictErrorMessageType[];
}
