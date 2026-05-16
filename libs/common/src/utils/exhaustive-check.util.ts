export function exhaustiveCheck(value: never): never {
  throw new Error(`Unhandled union case: ${JSON.stringify(value)}`);
}
