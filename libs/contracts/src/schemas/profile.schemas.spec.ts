import { addDays, format } from 'date-fns';
import { ProfileSchemas } from './profile.schemas';

describe('ProfileSchemas.birthDate', () => {
  const parse = (value: unknown) => ProfileSchemas.birthDate.safeParse(value);

  it('принимает дату в формате ISO 8601 YYYY-MM-DD', () => {
    const result = parse('1990-03-15');

    expect(result.success).toBe(true);
    expect(result.data).toBe('1990-03-15');
  });

  it('принимает null — дата рождения необязательна', () => {
    const result = parse(null);

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it('отвергает старый формат dd.MM.yyyy', () => {
    expect(parse('15.03.1990').success).toBe(false);
  });

  it('отвергает дату без ведущих нулей', () => {
    expect(parse('1990-3-15').success).toBe(false);
  });

  it('отвергает несуществующую календарную дату', () => {
    expect(parse('1990-02-30').success).toBe(false);
  });

  it('отвергает дату со временем', () => {
    expect(parse('1990-03-15T00:00:00.000Z').success).toBe(false);
  });

  it('отвергает дату из будущего', () => {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const result = parse(tomorrow);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Birth date cannot be in the future',
    );
  });
});
