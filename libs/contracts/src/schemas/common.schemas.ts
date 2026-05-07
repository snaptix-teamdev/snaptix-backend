import z from 'zod';

export namespace CommonSchemas {
  export const uuid = z.string().trim().uuid();
}
