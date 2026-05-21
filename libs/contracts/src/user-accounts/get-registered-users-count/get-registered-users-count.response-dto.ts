import { ApiProperty } from '@nestjs/swagger';

export class GetRegisteredUsersCountResponseDto {
  @ApiProperty({
    example: 125,
  })
  registeredUsersCount: number;
}
