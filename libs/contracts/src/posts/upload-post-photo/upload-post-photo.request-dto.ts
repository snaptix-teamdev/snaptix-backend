import { ApiProperty } from '@nestjs/swagger';

export class UploadPostPhotoRequestDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photo: Express.Multer.File;
}
