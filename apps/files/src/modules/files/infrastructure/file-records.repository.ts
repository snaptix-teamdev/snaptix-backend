import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { FileRecordConverter } from '../converter/file-record.converter';
import { FileRecordEntity } from '../domain/file-record.entity';

@Injectable()
export class FileRecordsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly converter: FileRecordConverter,
  ) {}

  async create(entity: FileRecordEntity): Promise<FileRecordEntity> {
    const model = this.converter.fromEntityToPrismaModel(entity);

    const result = await this.prisma.fileRecord.create({ data: model });

    return this.converter.fromPrismaModelToEntity(result);
  }

  async update(entity: FileRecordEntity): Promise<void> {
    const model = this.converter.fromEntityToPrismaModel(entity);

    await this.prisma.fileRecord.update({
      where: { id: model.id },
      data: model,
    });
  }

  async findById(id: string): Promise<FileRecordEntity | null> {
    const result = await this.prisma.fileRecord.findUnique({ where: { id } });

    return result ? this.converter.fromPrismaModelToEntity(result) : null;
  }

  async findByStorageKey(storageKey: string): Promise<FileRecordEntity | null> {
    const result = await this.prisma.fileRecord.findUnique({
      where: { storageKey },
    });

    return result ? this.converter.fromPrismaModelToEntity(result) : null;
  }
}
