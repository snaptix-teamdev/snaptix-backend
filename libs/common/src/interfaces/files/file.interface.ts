export const FileStatus = {
  PENDING: 'PENDING',
  INVALID: 'INVALID',
  CONFIRMED: 'CONFIRMED',
  READY: 'READY',
} as const;
export type FileStatus = (typeof FileStatus)[keyof typeof FileStatus];

export const FileEntityType = {
  POST_PHOTO: 'POST_PHOTO',
  USER_AVATAR: 'USER_AVATAR',
} as const;
export type FileEntityType =
  (typeof FileEntityType)[keyof typeof FileEntityType];

export interface IFile {
  id: string;
  ownerId: string;
  entityType: FileEntityType;
  entityId: string | null;
  storageKey: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  status: FileStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
