import { ApiProperty } from '@nestjs/swagger';
import { ZodIssueCode } from 'zod/v4';

class BadRequestErrorMessageType {
  @ApiProperty({
    description: 'The error code expressed as a string value',
    example: ZodIssueCode.invalid_format,
    enum: ZodIssueCode,
  })
  code: string;

  @ApiProperty({
    description: 'The name of the field where the error occurred',
    example: 'email',
  })
  field: string;

  @ApiProperty({
    description: 'Brief description of the problem',
    example: 'Invalid email address',
  })
  message: string;
}

export class BadRequestErrorsResponseDto {
  /**
   * List of validation errors
   */
  errors: BadRequestErrorMessageType[];
}
