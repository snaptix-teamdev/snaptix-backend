import { ApiProperty } from '@nestjs/swagger';

class GetGeoListItem {
  @ApiProperty({ example: 783754 })
  id: number;

  @ApiProperty({ example: 'Albania' })
  name: string;
}

export class GetGeoListResponseDto {
  /** Страны, регионы или города — в зависимости от переданных параметров */
  @ApiProperty({ type: [GetGeoListItem] })
  result: GetGeoListItem[];
}
