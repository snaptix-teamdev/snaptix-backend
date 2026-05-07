import { ApiProperty } from '@nestjs/swagger';

class UnauthorizedErrorMessageType {
  @ApiProperty({
    description: 'The HTTP status code of the response',
    example: 401,
  })
  status: 401;

  @ApiProperty({
    description: 'The error code expressed as a string value',
    example: 'UNAUTHORIZED',
  })
  code: string;

  @ApiProperty({
    description: 'The name of the field where the error occurred',
    example: null,
  })
  field: string;

  @ApiProperty({
    description: 'Brief description of the problem',
    example: 'Unauthorized',
  })
  message: string;
}

export class UnauthorizedErrorsResponseDto {
  /**
   * List of validation errors
   */
  errors: UnauthorizedErrorMessageType[];
}
