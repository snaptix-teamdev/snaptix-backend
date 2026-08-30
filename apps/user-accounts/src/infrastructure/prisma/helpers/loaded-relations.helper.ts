/**
 * Prisma типизирует опциональные 1:1 связи как `T | null`, даже когда для домена
 * связь обязательна. Этот тип фиксирует результат проверки: после него связь
 * не nullable и на уровне типов.
 */
export type WithLoadedRelations<
  TModel,
  TRelations extends keyof TModel,
> = TModel & {
  [K in TRelations]-?: NonNullable<TModel[K]>;
};

export function requireLoadedRelations<
  TModel extends object,
  TRelations extends keyof TModel,
>(
  model: TModel,
  relations: readonly TRelations[],
  modelName: string,
): WithLoadedRelations<TModel, TRelations> {
  for (const relation of relations) {
    if (model[relation] == null) {
      throw new Error(
        `${modelName}: required relation "${String(relation)}" is not loaded or missing in database`,
      );
    }
  }
  return model as WithLoadedRelations<TModel, TRelations>;
}
