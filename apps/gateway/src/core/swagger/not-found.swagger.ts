import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { NotFoundErrorsResponseDto } from './dto/not-found-error.response-dto';

export const ApiNotFoundCustomResponse = () =>
  ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundErrorsResponseDto,
    description: 'Not Found',
  });
