import { ApiProperty } from '@nestjs/swagger';

class ForbiddenErrorMessageType {
  @ApiProperty({
    description: 'The HTTP status code of the response',
    example: 403,
  })
  status: 403;

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
