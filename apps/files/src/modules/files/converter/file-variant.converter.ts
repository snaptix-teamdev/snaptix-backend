import { Injectable } from '@nestjs/common';
import { IFileVariant, UniversalConverter } from '@snaptix/common';
import { FileVariantEntity } from '../domain/file-variant.entity';

const modelToEntity = (model: IFileVariant): FileVariantEntity =>
  FileVariantEntity.restore(model);

const entityToModel = (entity: FileVariantEntity): IFileVariant => ({
  id: entity.id,
  fileRecordId: entity.fileRecordId,
  width: entity.width,
  height: entity.height,
  storageKey: entity.storageKey,
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
