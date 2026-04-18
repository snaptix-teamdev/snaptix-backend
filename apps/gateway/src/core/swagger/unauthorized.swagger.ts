import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { UnauthorizedErrorsResponseDto } from './dto/unauthorized-error.response-dto';

export const ApiUnauthorizedCustomResponse = () =>
  ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: UnauthorizedErrorsResponseDto,
    description: 'Unauthorized',
  });
