import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { BadRequestErrorsResponseDto } from './dto/bad-request-errors.response-dto';

export const ApiBadRequestCustomResponse = () =>
  ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BadRequestErrorsResponseDto,
    description: 'Incorrect data',
  });
