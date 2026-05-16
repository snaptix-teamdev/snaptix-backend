export interface IFileVariant {
  id: string;
  storageKey: string;
  mimeType: string;
  byteSize: bigint | null;
  width: number | null;
  height: number | null;
  originalFileId: string;
  createdAt: Date;
  updatedAt: Date;
}
