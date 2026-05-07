export class GetPostByIdMsResponseDto {
  id: string;
  description: string | null;
  media: { fileId: string }[];
  updatedAt: Date;
  createdAt: Date;
}
