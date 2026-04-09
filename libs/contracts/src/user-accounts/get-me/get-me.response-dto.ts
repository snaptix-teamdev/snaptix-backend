import { IUser } from '@snaptix/common';
import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class GetMeResponseDto implements Pick<
  IUser,
  'id' | 'email' | 'username' | 'createdAt'
> {
  @ApiProperty({
    example: randomUUID(),
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    example: 'some-username',
  })
  username: string;

  @ApiProperty({
    example: new Date(),
  })
  createdAt: Date;
}
