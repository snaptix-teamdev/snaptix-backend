import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { FileConverter } from '../converter/file.converter';
import { FileEntity } from '../domain/file.entity';

@Injectable()
export class FilesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly converter: FileConverter,
  ) {}

  async create(entity: FileEntity): Promise<FileEntity> {
    const model = this.converter.fromEntityToPrismaModel(entity);

    const result = await this.prisma.file.create({
      data: model,
    });

    return this.converter.fromPrismaModelToEntity(result);
  }

  async update(entity: FileEntity): Promise<void> {
    const model = this.converter.fromEntityToPrismaModel(entity);
    const { updatedAt: _updatedAt, ...restModel } = model;

    await this.prisma.file.update({
      where: { id: model.id },
      data: { ...restModel },
    });
  }

  async updateMany(entities: FileEntity[]): Promise<void> {
    const models = entities.map((e) =>
      this.converter.fromEntityToPrismaModel(e),
    );

    const restModels = models.map(
      ({ updatedAt: _updatedAt, ...restModel }) => restModel,
    );

    await this.prisma.$transaction(
      restModels.map((rm) =>
        this.prisma.file.update({ where: { id: rm.id }, data: rm }),
      ),
    );
  }

  async findById(id: string): Promise<FileEntity | null> {
    const result = await this.prisma.file.findUnique({ where: { id } });

    return result ? this.converter.fromPrismaModelToEntity(result) : null;
  }

  async findByStorageKey(storageKey: string): Promise<FileEntity | null> {
    const result = await this.prisma.file.findUnique({
      where: { storageKey },
    });

    return result ? this.converter.fromPrismaModelToEntity(result) : null;
  }

  async findManyByIds(fileIds: string[]): Promise<FileEntity[]> {
    const result = await this.prisma.file.findMany({
      where: { id: { in: fileIds } },
    });

    return result.map((f) => this.converter.fromPrismaModelToEntity(f));
  }

  async findManyByEntityId(entityId: string): Promise<FileEntity[]> {
    const result = await this.prisma.file.findMany({
      where: { entityId, deletedAt: null },
    });

    return result.map((f) => this.converter.fromPrismaModelToEntity(f));
  }

  async softDeleteManyByEntityId(entityId: string): Promise<void> {
    await this.prisma.file.updateMany({
      where: { entityId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
