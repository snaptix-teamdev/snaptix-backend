import { CheckGeoExistsPayload } from './check-geo-exists.payload';

describe('CheckGeoExistsPayload', () => {
  const schema = CheckGeoExistsPayload.schema;

  const valid = { countryId: 1, regionId: 2, cityId: 3 };

  it('принимает три положительных целых ID', () => {
    const result = schema.safeParse(valid);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(valid);
  });

  it('приводит числовые строки к числам', () => {
    const result = schema.safeParse({
      countryId: '1',
      regionId: '2',
      cityId: '3',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(valid);
  });

  it.each(['countryId', 'regionId', 'cityId'] as const)(
    'отклоняет payload без обязательного поля %s',
    (field) => {
      const input: Record<string, unknown> = { ...valid };
      delete input[field];

      const result = schema.safeParse(input);

      expect(result.success).toBe(false);
    },
  );

  it.each([
    ['ноль', 0],
    ['отрицательное число', -1],
    ['дробное число', 1.5],
    ['нечисловую строку', 'abc'],
    ['значение за пределом Postgres integer', 2_147_483_648],
  ])('отклоняет %s в cityId', (_case, cityId) => {
    const result = schema.safeParse({ ...valid, cityId });

    expect(result.success).toBe(false);
  });
});
