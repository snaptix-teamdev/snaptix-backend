import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

class Owner {
  @ApiProperty({
    example: randomUUID(),
  })
  userId: string;

  @ApiProperty({
    example: 'user-name',
  })
  username: string;

  @ApiProperty({
    example:
      'https://swebtoon-phinf.pstatic.net/20241203_198/1733185516062oNh7H_PNG/thumbnail.jpg',
  })
  avatar: string | null;
}

export class GetUserPostsResponseDto {
  posts: {
    id: string;
    description: string | null;
    media: { mediaId: string; url: string }[];
    owner: Owner;
    updatedAt: Date;
    createdAt: Date;
  }[];
  nextCursorId: string | null;
}
