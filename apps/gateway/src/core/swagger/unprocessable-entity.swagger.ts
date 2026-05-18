import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { UnprocessableEntityErrorsResponseDto } from './dto/unprocessable-entity-error.response-dto';

export const ApiUnprocessableEntityCustomResponse = () =>
  ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    type: UnprocessableEntityErrorsResponseDto,
    description: 'One or more items in the operation failed',
  });
