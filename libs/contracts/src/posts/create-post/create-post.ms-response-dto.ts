export class CreatePostMsResponseDto {
  id: string;
  description: string | null;
  media: { fileId: string }[];
  updatedAt: Date;
  createdAt: Date;
}
