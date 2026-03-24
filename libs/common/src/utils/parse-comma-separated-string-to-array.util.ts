export function parseCommaSeparatedStringToArrayUtil(str?: string): string[] {
  if (!str) return [];

  return str
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
