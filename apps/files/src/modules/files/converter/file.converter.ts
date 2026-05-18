import { Injectable } from '@nestjs/common';
import { IFile, UniversalConverter } from '@snaptix/common';
import { FileEntity } from '../domain/file.entity';

const modelToEntity = (model: IFile): FileEntity => FileEntity.restore(model);

const entityToModel = (entity: FileEntity): IFile => ({
  id: entity.id,
  ownerId: entity.ownerId,
  entityType: entity.entityType,
  entityId: entity.entityId,
  storageKey: entity.storageKey,
  fileName: entity.fileName,
  mimeType: entity.mimeType,
  status: entity.status,
  byteSize: entity.byteSize,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
  deletedAt: entity.deletedAt,
});

@Injectable()
export class FileConverter extends UniversalConverter<FileEntity, IFile> {
  constructor() {
    super(modelToEntity, entityToModel);
  }
}
