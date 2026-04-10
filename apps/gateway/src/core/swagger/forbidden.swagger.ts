import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { ForbiddenErrorsResponseDto } from './dto/forbidden-error.response-dto';

export const ApiForbiddenCustomResponse = () =>
  ApiResponse({
    status: HttpStatus.FORBIDDEN,
    type: ForbiddenErrorsResponseDto,
    description: 'Forbidden',
  });
