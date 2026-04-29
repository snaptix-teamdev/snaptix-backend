import { Injectable } from '@nestjs/common';
import { IFileRecord, UniversalConverter } from '@snaptix/common';
import { FileRecordEntity } from '../domain/file-record.entity';

const modelToEntity = (model: IFileRecord): FileRecordEntity =>
  FileRecordEntity.restore(model);

const entityToModel = (entity: FileRecordEntity): IFileRecord => ({
  id: entity.id,
  userId: entity.userId,
  storageKey: entity.storageKey,
  fileName: entity.fileName,
  mimeType: entity.mimeType,
  isRevoked: entity.isRevoked,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});

@Injectable()
export class FileRecordConverter extends UniversalConverter<
  FileRecordEntity,
  IFileRecord
> {
  constructor() {
    super(modelToEntity, entityToModel);
  }
}
