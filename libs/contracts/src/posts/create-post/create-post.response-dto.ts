export class CreatePostResponseDto {
  id: string;
  description: string | null;
  media: { fileId: string; url: string }[];
  updatedAt: string;
  createdAt: string;
}
