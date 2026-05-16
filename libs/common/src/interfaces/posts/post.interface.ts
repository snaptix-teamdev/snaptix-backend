export interface IPostMedia {
  id: string;
  fileId: string;
  storageKey: string;
  order: number;
}

export interface IPost {
  id: string;
  description: string | null;
  userId: string;
  media: IPostMedia[];
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
}
