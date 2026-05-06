import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

class Media {
  @ApiProperty({
    example: randomUUID(),
  })
  fileId: string;

  @ApiProperty({
    example:
      'https://swebtoon-phinf.pstatic.net/20241203_198/1733185516062oNh7H_PNG/thumbnail.jpg',
  })
  url: string;
}

export class GetPostByIdResponseDto {
  @ApiProperty({
    example: randomUUID(),
  })
  id: string;

  @ApiProperty({
    example: 'Крайне захватывающее описание',
  })
  description: string | null;

  @ApiProperty({
    type: [Media],
  })
  media: { fileId: string; url: string }[];

  updatedAt: Date;
  createdAt: Date;
}
