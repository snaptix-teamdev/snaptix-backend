export class CreatePostMsResponseDto {
  id: string;
  description: string | null;
  media: { fileId: string }[];
  updatedAt: string;
  createdAt: string;
}
