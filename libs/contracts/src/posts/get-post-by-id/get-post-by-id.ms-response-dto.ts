export class GetPostByIdMsResponseDto {
  id: string;
  description: string | null;
  userId: string;
  media: { id: string; storageKey: string }[];
  updatedAt: Date;
  createdAt: Date;
}
