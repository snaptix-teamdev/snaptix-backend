/** Date → 'YYYY-MM-DD' */
export function formatBirthDate(birthDate: Date | null): string | null {
  if (!birthDate) return null;

  return birthDate.toISOString().slice(0, 10);
}

/** 'YYYY-MM-DD' → полночь UTC */
export function parseBirthDate(raw: string): Date {
  return new Date(`${raw}T00:00:00.000Z`);
}
