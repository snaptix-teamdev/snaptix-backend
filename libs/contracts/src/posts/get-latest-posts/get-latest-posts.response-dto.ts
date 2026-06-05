export class GetLatestPostsResponseDto {
  posts: {
    id: string;
    description: string | null;
    media: { mediaId: string; url: string }[];
    updatedAt: Date;
    createdAt: Date;
    owner: {
      userId: string;
      username: string;
      avatar: string | null;
    };
  }[];
}
