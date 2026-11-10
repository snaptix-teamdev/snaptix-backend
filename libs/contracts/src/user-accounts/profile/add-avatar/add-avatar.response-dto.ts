import { ApiProperty } from '@nestjs/swagger';

export class AddAvatarResponseDto {
  @ApiProperty({
    example:
      'https://storage.yandexcloud.net/snaptix-files/' +
      '9b9cec64-9a28-47b2-8c81-f4e553689b97/user_avatar/2f1c...c8e.png',
  })
  avatarUrl: string;
}
