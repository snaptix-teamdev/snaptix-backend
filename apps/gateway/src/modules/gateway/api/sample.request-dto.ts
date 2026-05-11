import { ApiProperty } from '@nestjs/swagger';

export class SampleDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  file?: Express.Multer.File;
}
