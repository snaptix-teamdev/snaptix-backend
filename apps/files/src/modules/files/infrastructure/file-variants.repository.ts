import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { FileVariantConverter } from '../converter/file-variant.converter';
import { FileVariantEntity } from '../domain/file-variant.entity';

@Injectable()
export class FileVariantsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly converter: FileVariantConverter,
  ) {}

  async create(entity: FileVariantEntity): Promise<FileVariantEntity> {
    const model = this.converter.fromEntityToPrismaModel(entity);

    const result = await this.prisma.fileVariant.create({ data: model });

    return this.converter.fromPrismaModelToEntity(result);
  }
}
