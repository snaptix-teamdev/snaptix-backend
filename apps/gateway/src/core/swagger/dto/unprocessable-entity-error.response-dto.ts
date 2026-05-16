import { ApiProperty } from '@nestjs/swagger';
import { ERRORS } from '@snaptix/contracts';

class UnprocessableEntityErrorMessageType {
  @ApiProperty({
    description: 'ID of the item that failed processing',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  itemId: string;

  @ApiProperty({
    description: 'The HTTP status code of this individual error',
    example: 404,
  })
  status: number;

  @ApiProperty({
    description: 'The error code expressed as a string value',
    example: Object.values(ERRORS)[0]?.code,
    enum: Object.values(ERRORS).map((error) => error.code),
  })
  code: string;

  @ApiProperty({
    description: 'The name of the field where the error occurred',
    example: null,
    nullable: true,
  })
  field: string | null;

  @ApiProperty({
    description: 'Brief description of the problem',
    example: Object.values(ERRORS)[0]?.message,
  })
  message: string;
}

export class UnprocessableEntityErrorsResponseDto {
  /**
   * List of operation item errors
   */
  errors: UnprocessableEntityErrorMessageType[];
}
