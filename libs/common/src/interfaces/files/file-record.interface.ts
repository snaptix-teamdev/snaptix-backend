export interface IFileRecord {
  id: string;
  userId: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
