import { IFileRecord } from '@snaptix/common';
import { CreateFileRecordEntityDto } from './dto/create-file-record.entity-dto';

export class FileRecordEntity implements IFileRecord {
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

  private constructor() {}

  static create(dto: CreateFileRecordEntityDto): FileRecordEntity {
    const entity = new FileRecordEntity();

    entity.userId = dto.userId;
    entity.storageKey = dto.storageKey;
    entity.fileName = dto.fileName;
    entity.mimeType = dto.mimeType;
    entity.fileSize = null;
    entity.isUploaded = false;
    entity.isValid = null;
    entity.isDownload = false;
    entity.isRevoked = false;

    return entity;
  }

  static restore(model: IFileRecord): FileRecordEntity {
    const entity = new FileRecordEntity();
    Object.assign(entity, model);
    return entity;
  }

  markUploaded(fileSize: bigint): void {
    this.isUploaded = true;
    this.fileSize = fileSize;
  }

  markValid(): void {
    this.isValid = true;
    this.isDownload = true;
  }

  markInvalid(): void {
    this.isValid = false;
  }

  revoke(): void {
    this.isRevoked = true;
  }
}
