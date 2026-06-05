import { IPost, IPostMedia } from '@snaptix/common';

type MediaPayloadType = Pick<IPostMedia, 'id' | 'storageKey'>;
type PostPayloadType = Pick<
  IPost,
  'id' | 'description' | 'updatedAt' | 'createdAt'
> & { media: MediaPayloadType[] };

export class PostViewDto {
  id: string;
  description: string | null;
  media: { mediaId: string; url: string }[];
  owner: {
    userId: string;
    username: string;
    avatar: string | null;
  };
  updatedAt: Date;
  createdAt: Date;

  constructor(payload: {
    post: PostPayloadType;
    baseS3Url: string;
    userInfo: { userId: string; username: string; avatar: string | null };
  }) {
    this.id = payload.post.id;
    this.description = payload.post.description;
    this.media = payload.post.media.map((m) => ({
      mediaId: m.id,
      url: `${payload.baseS3Url}/${m.storageKey}`,
    }));
    this.owner = {
      userId: payload.userInfo.userId,
      username: payload.userInfo.username,
      avatar: payload.userInfo.avatar,
    };
    this.updatedAt = payload.post.updatedAt;
    this.createdAt = payload.post.createdAt;
  }
}
