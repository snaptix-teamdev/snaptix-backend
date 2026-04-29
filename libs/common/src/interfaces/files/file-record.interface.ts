export interface IFileRecord {
  id: string;
  userId: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  fileSize: bigint | null;
  isUploaded: boolean;
  isValid: boolean | null;
  isDownload: boolean;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
