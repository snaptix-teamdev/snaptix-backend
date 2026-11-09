import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

class GetProfileSettingsGeoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Belarus' })
  name: string;
}

export class GetProfileSettingsResponseDto {
  @ApiProperty({ example: randomUUID() })
  userId: string;

  @ApiProperty({ example: 'some-username' })
  username: string;

  @ApiProperty({ example: 'Ivan', nullable: true })
  firstName: string | null;

  @ApiProperty({ example: 'Ivanov', nullable: true })
  lastName: string | null;

  @ApiProperty({
    example:
      'https://storage.yandexcloud.net/snaptix-files/' +
      '9b9cec64-9a28-47b2-8c81-f4e553689b97/user_avatar/2f1c...c8e.png',
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({
    example: '1990-03-15',
    nullable: true,
    format: 'date',
    description: 'Дата рождения в формате ISO 8601 — YYYY-MM-DD',
  })
  birthDate: string | null;

  @ApiProperty({ example: 'Пара слов о себе', nullable: true })
  aboutMe: string | null;

  @ApiProperty({ type: GetProfileSettingsGeoDto, nullable: true })
  country: GetProfileSettingsGeoDto | null;

  @ApiProperty({ type: GetProfileSettingsGeoDto, nullable: true })
  region: GetProfileSettingsGeoDto | null;

  @ApiProperty({ type: GetProfileSettingsGeoDto, nullable: true })
  city: GetProfileSettingsGeoDto | null;
}
