import { Injectable } from '@nestjs/common';
import { IFileVariant, UniversalConverter } from '@snaptix/common';
import { FileVariantEntity } from '../domain/file-variant.entity';

const modelToEntity = (model: IFileVariant): FileVariantEntity =>
  FileVariantEntity.restore(model);

const entityToModel = (entity: FileVariantEntity): IFileVariant => ({
  id: entity.id,
  originalFileId: entity.originalFileId,
  storageKey: entity.storageKey,
  byteSize: entity.byteSize,
  mimeType: entity.mimeType,
  width: entity.width,
  height: entity.height,
  updatedAt: entity.updatedAt,
  createdAt: entity.createdAt,
});

@Injectable()
export class FileVariantConverter extends UniversalConverter<
  FileVariantEntity,
  IFileVariant
> {
  constructor() {
    super(modelToEntity, entityToModel);
  }
}
