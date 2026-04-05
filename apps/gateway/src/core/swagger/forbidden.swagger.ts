import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export const ApiForbiddenCustomResponse = () =>
  ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Trying to edit an entity that doesn't belong to user",
  });
