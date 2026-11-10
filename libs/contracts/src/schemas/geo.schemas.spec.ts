import { GeoSchemas } from './geo.schemas';

const POSTGRES_INT4_MAX = 2_147_483_647;

describe.each([
  ['countryId', GeoSchemas.countryId],
  ['regionId', GeoSchemas.regionId],
  ['cityId', GeoSchemas.cityId],
] as const)('GeoSchemas.%s', (_name, schema) => {
  const parse = (value: unknown) => schema.safeParse(value);

  it('принимает положительное целое', () => {
    const result = parse(1);

    expect(result.success).toBe(true);
    expect(result.data).toBe(1);
  });

  it('приводит числовую строку к числу', () => {
    const result = parse('42');

    expect(result.success).toBe(true);
    expect(result.data).toBe(42);
  });

  it('принимает максимум Postgres integer', () => {
    expect(parse(POSTGRES_INT4_MAX).success).toBe(true);
  });

  it('отклоняет значение за пределом Postgres integer', () => {
    // без верхней границы такое значение дошло бы до БД и упало там 500-й
    expect(parse(POSTGRES_INT4_MAX + 1).success).toBe(false);
    expect(parse(99999999999999).success).toBe(false);
  });

  it.each([
    ['ноль', 0],
    ['отрицательное число', -1],
    ['дробное число', 1.5],
    ['нечисловую строку', 'abc'],
  ])('отклоняет %s', (_case, value) => {
    expect(parse(value).success).toBe(false);
  });
});
