export class CreatePostResponseDto {
  id: string;
  description: string | null;
  media: { mediaId: string; url: string }[];
  updatedAt: Date;
  createdAt: Date;
}
