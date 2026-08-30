import z from 'zod';
import { isFuture, parseISO } from 'date-fns';
import { GeoSchemas } from '@snaptix/contracts/schemas/geo.schemas';

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

  export const birthDate = z.iso
    .date()
    .refine((v) => !isFuture(parseISO(v)), 'Birth date cannot be in the future')
    .nullable();

  export const aboutMe = z
    .string()
    .trim()
    .max(200)
    .regex(/^[A-Za-zА-Яа-яЁё0-9\s\p{P}\p{S}]*$/u)
    .nullable();

  export const countryId = GeoSchemas.countryId.nullable();
  export const regionId = GeoSchemas.regionId.nullable();
  export const cityId = GeoSchemas.cityId.nullable();
}
