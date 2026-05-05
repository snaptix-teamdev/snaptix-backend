export interface IPost {
  id: string;
  description: string | null;
  userId: string;
  media: string[];
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
}
