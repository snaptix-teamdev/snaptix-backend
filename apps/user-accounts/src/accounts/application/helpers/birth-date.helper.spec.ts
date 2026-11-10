import { formatBirthDate, parseBirthDate } from './birth-date.helper';

describe('formatBirthDate', () => {
  it('форматирует дату в YYYY-MM-DD с ведущими нулями', () => {
    expect(formatBirthDate(new Date(Date.UTC(1990, 2, 5)))).toBe('1990-03-05');
  });

  it('берёт части даты по UTC, а не по локальной таймзоне', () => {
    // полночь UTC — в таймзонах западнее Гринвича это ещё предыдущий день
    expect(formatBirthDate(new Date('2000-01-01T00:00:00.000Z'))).toBe(
      '2000-01-01',
    );
  });

  it('возвращает null для незаполненной даты', () => {
    expect(formatBirthDate(null)).toBeNull();
  });
});

describe('parseBirthDate', () => {
  it('разбирает YYYY-MM-DD в полночь UTC', () => {
    expect(parseBirthDate('1990-03-15').toISOString()).toBe(
      '1990-03-15T00:00:00.000Z',
    );
  });

  it('не сдвигает день в локальной таймзоне сервера', () => {
    const parsed = parseBirthDate('1990-03-15');

    expect(parsed.getUTCFullYear()).toBe(1990);
    expect(parsed.getUTCMonth()).toBe(2);
    expect(parsed.getUTCDate()).toBe(15);
  });

  it('переживает round-trip parse → format', () => {
    expect(formatBirthDate(parseBirthDate('1990-03-15'))).toBe('1990-03-15');
  });
});
