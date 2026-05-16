import {
  DomainException,
  FileEntityType,
  FileStatus,
  IFile,
} from '@snaptix/common';
import { CreateFileEntityDto } from './dto/file-dto/create-file.entity-dto';
import { FILES_ERRORS } from '@snaptix/contracts';

export class FileEntity implements IFile {
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

  private constructor() {}

  static create(payload: CreateFileEntityDto): FileEntity {
    const entity = new FileEntity();

    entity.ownerId = payload.ownerId;
    entity.entityType = payload.entityType;
    entity.entityId = null;
    entity.storageKey = payload.storageKey;
    entity.fileName = payload.fileName;
    entity.mimeType = payload.mimeType;
    entity.byteSize = payload.byteSize;
    entity.status = payload.status;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    entity.deletedAt = null;

    return entity;
  }

  static restore(model: IFile): FileEntity {
    const entity = new FileEntity();
    Object.assign(entity, model);
    return entity;
  }

  isConfirmed(): boolean {
    return this.status === FileStatus.CONFIRMED;
  }

  markAsInvalid(detectedMimeType: string): void {
    this.mimeType = detectedMimeType;
    this.status = FileStatus.INVALID;
  }

  markAsConfirmed(detectedMimeType: string, newStorageKey: string): void {
    this.storageKey = newStorageKey;
    this.mimeType = detectedMimeType;
    this.status = FileStatus.CONFIRMED;
  }

  markAsReady(): void {
    if (this.status !== FileStatus.CONFIRMED) {
      throw new DomainException(FILES_ERRORS.FILE_NOT_CONFIRMED);
    }
    this.status = FileStatus.READY;
  }

  linkEntity(payload: {
    entityId: string;
    userId: string;
    entityType: FileEntityType;
  }): void {
    if (!this.isOwner(payload.userId)) {
      throw new DomainException(FILES_ERRORS.FILE_NOT_BELONG_USER);
    }

    if (!this.isEntityType(payload.entityType)) {
      throw new DomainException(FILES_ERRORS.FILE_NOT_BELONG_ENTITY);
    }

    if (!this.isConfirmed() && !this.isReady()) {
      throw new DomainException(FILES_ERRORS.FILE_NOT_CONFIRMED);
    }

    if (this.isLinked() && !this.isLinkedTo(payload.entityId)) {
      throw new DomainException(FILES_ERRORS.FILE_LINKED_TO_OTHER_ENTITY);
    }

    this.entityId = payload.entityId;
  }

  isEntityType(entityType: FileEntityType): boolean {
    return this.entityType === entityType;
  }

  isOwner(ownerId: string): boolean {
    return this.ownerId === ownerId;
  }

  isLinked() {
    return this.entityId !== null;
  }

  isLinkedTo(entityId: string) {
    return this.entityId === entityId;
  }

  isReady(): boolean {
    return this.status === FileStatus.READY;
  }
}
