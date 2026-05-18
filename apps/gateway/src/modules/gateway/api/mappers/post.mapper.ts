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
  updatedAt: Date;
  createdAt: Date;

  constructor(post: PostPayloadType, baseS3Url: string) {
    this.id = post.id;
    this.description = post.description;
    this.media = post.media.map((m) => ({
      mediaId: m.id,
      url: `${baseS3Url}/${m.storageKey}`,
    }));
    this.updatedAt = post.updatedAt;
    this.createdAt = post.createdAt;
  }
}
