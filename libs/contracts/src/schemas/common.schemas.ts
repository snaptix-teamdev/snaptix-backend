import z from 'zod';

export namespace CommonSchemas {
  export const uuid = z.string().trim().uuid();
  export const pageSize = z.coerce.number().int().min(1).max(50);
}
