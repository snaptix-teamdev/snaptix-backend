import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

class ForbiddenErrorMessageType {
  @ApiProperty({
    description: 'The HTTP status code of the response',
    example: HttpStatus.FORBIDDEN,
  })
  status: HttpStatus;

  @ApiProperty({
    description: 'The error code expressed as a string value',
    example: 'FORBIDDEN',
  })
  code: string;

  @ApiProperty({
    description: 'The name of the field where the error occurred',
    example: null,
  })
  field: string;

  @ApiProperty({
    description: 'Brief description of the problem',
    example: 'Forbidden',
  })
  message: string;
}

export class ForbiddenErrorsResponseDto {
  /**
   * List of validation errors
   */
  errors: ForbiddenErrorMessageType[];
}
