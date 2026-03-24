import { IConverter } from '@snaptix/common/interfaces/converter/converter.interface';

export class UniversalConverter<Entity, Model> implements IConverter<
  Entity,
  Model
> {
  private readonly entityFactory: (model: Model) => Entity;
  private readonly modelFactory: (entity: Entity) => Model;

  constructor(
    entityFactory: (model: Model) => Entity,
    modelFactory: (entity: Entity) => Model,
  ) {
    this.entityFactory = entityFactory;
    this.modelFactory = modelFactory;
  }

  fromPrismaModelToEntity(prismaModel: Model): Entity {
    return this.entityFactory(prismaModel);
  }

  fromPrismaModelToEntityOrNull(prismaModel: null | Model): null | Entity {
    return prismaModel != null
      ? this.fromPrismaModelToEntity(prismaModel)
      : null;
  }

  fromPrismaModelsToEntities(prismaModels: Model[]): Entity[] {
    return prismaModels.map((model) => this.fromPrismaModelToEntity(model));
  }

  fromEntityToPrismaModel(entity: Entity): Model {
    return this.modelFactory(entity);
  }

  fromEntitiesToPrismaModels(entities: Entity[]): Model[] {
    return entities.map((entity) => this.fromEntityToPrismaModel(entity));
  }
}
