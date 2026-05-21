import { IPostMedia } from '@snaptix/common';

type LatestPostMediaPayload = Pick<IPostMedia, 'id' | 'storageKey'>;

type LatestPostPayload = {
  id: string;
  description: string | null;
  userId: string;
  media: LatestPostMediaPayload[];
  updatedAt: Date;
  createdAt: Date;
};

export class LatestPostViewDto {
  id: string;
  description: string | null;
  media: { mediaId: string; url: string }[];
  updatedAt: Date;
  createdAt: Date;
  owner: { firstName: string; lastName: string; avatar: string | null };

  constructor(payload: {
    post: LatestPostPayload;
    userInfo: { firstName: string; lastName: string; avatar: string | null };
    baseS3Url: string;
  }) {
    this.id = payload.post.id;
    this.description = payload.post.description;
    this.media = payload.post.media.map((m) => ({
      mediaId: m.id,
      url: `${payload.baseS3Url}/${m.storageKey}`,
    }));
    this.updatedAt = payload.post.updatedAt;
    this.createdAt = payload.post.createdAt;
    this.owner = {
      firstName: payload.userInfo.firstName,
      lastName: payload.userInfo.lastName,
      avatar: payload.userInfo.avatar,
    };
  }
}
