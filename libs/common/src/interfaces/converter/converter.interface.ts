export interface IConverter<Entity, Model> {
  fromEntitiesToPrismaModels(entities: Entity[]): Model[];
  fromEntityToPrismaModel(entity: Entity): Model;
  fromPrismaModelsToEntities(prismaModels: Model[]): Entity[];
  fromPrismaModelToEntity(prismaModel: Model): Entity;
}
