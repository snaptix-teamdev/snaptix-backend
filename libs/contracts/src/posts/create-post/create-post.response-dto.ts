export class CreatePostResponseDto {
  id: string;
  description: string | null;
  media: { fileId: string; url: string }[];
  updatedAt: Date;
  createdAt: Date;
}
