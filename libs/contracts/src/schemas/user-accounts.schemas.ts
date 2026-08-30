import z from 'zod';

export namespace UserAccountsSchemas {
  export const username = z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[0-9A-Za-z_-]+$/);
}
