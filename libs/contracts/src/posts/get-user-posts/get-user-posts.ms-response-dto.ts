export class GetUserPostsMsResponseDto {
  posts: {
    id: string;
    description: string | null;
    userId: string;
    media: { id: string; storageKey: string }[];
    updatedAt: Date;
    createdAt: Date;
  }[];
  nextCursorId: string | null;
}
