export class GetMyPostsMsResponseDto {
  posts: {
    id: string;
    description: string | null;
    media: { id: string; storageKey: string }[];
    updatedAt: Date;
    createdAt: Date;
  }[];
  nextCursorId: string | null;
}
