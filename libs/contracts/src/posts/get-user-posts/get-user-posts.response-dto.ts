export class GetUserPostsResponseDto {
  posts: {
    id: string;
    description: string | null;
    media: { mediaId: string; url: string }[];
    updatedAt: Date;
    createdAt: Date;
  }[];
  nextCursorId: string | null;
}
