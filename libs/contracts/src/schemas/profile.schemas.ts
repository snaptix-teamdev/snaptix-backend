import z from 'zod';

export namespace ProfileSchemas {
  export const username = z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[0-9A-Za-z_-]+$/);

  export const firstName = z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^[А-Яа-яA-Za-zЁё]+$/);

  export const lastName = z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^[А-Яа-яA-Za-zЁё]+$/);

  export const birthDate = z
    .string()
    .regex(/^\d{2}\.\d{2}\.\d{4}$/)
    .optional();

  export const aboutMe = z
    .string()
    .trim()
    .max(200)
    .regex(/^[A-Za-zА-Яа-яЁё0-9\s\p{P}\p{S}]+$/u)
    .optional();

  export const countryId = z.coerce.number().int().positive();
  export const regionId = z.coerce.number().int().positive();
  export const cityId = z.coerce.number().int().positive();
}
