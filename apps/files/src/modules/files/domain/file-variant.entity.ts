import { IFileVariant } from '@snaptix/common';
import { CreateFileVariantEntityDto } from './dto/file-variant-dto/create-file-variant.entity-dto';

export class FileVariantEntity implements IFileVariant {
  id: string;
  storageKey: string;
  mimeType: string;
  byteSize: bigint | null;
  width: number | null;
  height: number | null;
  originalFileId: string;
  createdAt: Date;
  updatedAt: Date;

  private constructor() {}

  static create(dto: CreateFileVariantEntityDto): FileVariantEntity {
    const entity = new FileVariantEntity();

    entity.originalFileId = dto.originalFileId;
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
