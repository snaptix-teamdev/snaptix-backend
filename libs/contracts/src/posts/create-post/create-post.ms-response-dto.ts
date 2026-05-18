export class CreatePostMsResponseDto {
  id: string;
  description: string | null;
  media: { id: string; storageKey: string }[];
  updatedAt: Date;
  createdAt: Date;
}
