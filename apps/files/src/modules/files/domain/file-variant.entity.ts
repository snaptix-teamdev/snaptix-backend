import { IFileVariant } from '@snaptix/common';
import { CreateFileVariantEntityDto } from './dto/create-file-variant.entity-dto';

export class FileVariantEntity implements IFileVariant {
  id: string;
  fileRecordId: string;
  width: number;
  height: number;
  storageKey: string;

  private constructor() {}

  static create(dto: CreateFileVariantEntityDto): FileVariantEntity {
    const entity = new FileVariantEntity();

    entity.fileRecordId = dto.fileRecordId;
    entity.width = dto.width;
    entity.height = dto.height;
    entity.storageKey = dto.storageKey;

    return entity;
  }

  static restore(model: IFileVariant): FileVariantEntity {
    const entity = new FileVariantEntity();
    Object.assign(entity, model);
    return entity;
  }
}
