import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { ConflictErrorsResponseDto } from './dto/conflict-error.response-dto';

export const ApiConflictCustomResponse = () =>
  ApiResponse({
    status: HttpStatus.CONFLICT,
    type: ConflictErrorsResponseDto,
    description: 'Conflict data',
  });
