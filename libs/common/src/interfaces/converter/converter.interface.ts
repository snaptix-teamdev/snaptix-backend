export interface IConverter<Entity, ReadModel, WriteModel = ReadModel> {
  fromEntitiesToPrismaModels(entities: Entity[]): WriteModel[];
  fromEntityToPrismaModel(entity: Entity): WriteModel;
  fromPrismaModelsToEntities(prismaModels: ReadModel[]): Entity[];
  fromPrismaModelToEntity(prismaModel: ReadModel): Entity;
}
