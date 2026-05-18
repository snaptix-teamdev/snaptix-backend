import { ApiProperty } from '@nestjs/swagger';

export class GetUploadUrlResponseDto {
  @ApiProperty({
    example: '9b9cec64-9a28-47b2-8c81-f4e553689b97',
  })
  fileId: string;

  @ApiProperty({
    example:
      'https://my-bucket.s3.eu-central-1.amazonaws.com/uploads/42/9f3a8b1c-7d4e-4f2a-b1c8-3e9d6f7a8b2c.png' +
      '?X-Amz-Algorithm=AWS4-HMAC-SHA256' +
      '&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD' +
      '&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20260512%2Feu-central-1%2Fs3%2Faws4_request' +
      '&X-Amz-Date=20260512T143052Z' +
      '&X-Amz-Expires=300' +
      '&X-Amz-Signature=4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b' +
      '&X-Amz-SignedHeaders=host%3Bcontent-type',
  })
  url: string;
}
