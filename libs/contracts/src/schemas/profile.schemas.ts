import z from 'zod';
import { isFuture, isValid, parse } from 'date-fns';

export namespace ProfileSchemas {
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
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Expected format dd.mm.yyyy')
    .refine(
      (v) => isValid(parse(v, 'dd.MM.yyyy', new Date())),
      'Invalid calendar date',
    )
    .refine(
      (v) => !isFuture(parse(v, 'dd.MM.yyyy', new Date())),
      'Birth date cannot be in the future',
    )
    .nullable();

  export const aboutMe = z
    .string()
    .trim()
    .max(200)
    .regex(/^[A-Za-zА-Яа-яЁё0-9\s\p{P}\p{S}]*$/u)
    .nullable();

  export const countryId = z.coerce.number().int().positive().nullable();
  export const regionId = z.coerce.number().int().positive().nullable();
  export const cityId = z.coerce.number().int().positive().nullable();
}
