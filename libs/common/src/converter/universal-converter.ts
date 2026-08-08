import { IConverter } from '@snaptix/common/interfaces/converter/converter.interface';

export class UniversalConverter<
  Entity,
  ReadModel,
  WriteModel = ReadModel,
> implements IConverter<Entity, ReadModel, WriteModel> {
  private readonly entityFactory: (model: ReadModel) => Entity;
  private readonly modelFactory: (entity: Entity) => WriteModel;

  constructor(
    entityFactory: (model: ReadModel) => Entity,
    modelFactory: (entity: Entity) => WriteModel,
  ) {
    this.entityFactory = entityFactory;
    this.modelFactory = modelFactory;
  }

  fromPrismaModelToEntity(prismaModel: ReadModel): Entity {
    return this.entityFactory(prismaModel);
  }

  fromPrismaModelToEntityOrNull(prismaModel: null | ReadModel): null | Entity {
    return prismaModel != null
      ? this.fromPrismaModelToEntity(prismaModel)
      : null;
  }

  fromPrismaModelsToEntities(prismaModels: ReadModel[]): Entity[] {
    return prismaModels.map((model) => this.fromPrismaModelToEntity(model));
  }

  fromEntityToPrismaModel(entity: Entity): WriteModel {
    return this.modelFactory(entity);
  }

  fromEntitiesToPrismaModels(entities: Entity[]): WriteModel[] {
    return entities.map((entity) => this.fromEntityToPrismaModel(entity));
  }
}
