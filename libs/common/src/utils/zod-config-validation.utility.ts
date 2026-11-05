import { z, ZodType } from 'zod';
import { Environments } from '../enums';
import { parseCommaSeparatedStringToArrayUtil } from './parse-comma-separated-string-to-array.util';

// Значения переменных в текст ошибки не попадают: среди них бывают секреты
// (пароли в строках подключения, ключи API), а ошибка уходит в логи.
export function zodConfigValidationUtility<T extends object>(
  schema: ZodType<T>,
  source: Record<string, string | undefined> = process.env,
): T {
  const result = schema.safeParse(source);

  if (!result.success) {
    throw new Error(
      result.error.issues
        .map((issue) =>
          // У .refine() на всю схему путь пустой
          issue.path.length
            ? `\nEnvironment: ${issue.path.join('.')}. ${issue.message}.`
            : `\n${issue.message}.`,
        )
        .join('\n'),
    );
  }

  return result.data;
}

const PORT_ERROR = 'Expected an integer from 1 to 65535, example: 3000';

// Сначала проверяем строку: z.coerce.number() принял бы и "0x1F", и "1e3"
export const envPort = z
  .string({ error: PORT_ERROR })
  .regex(/^\d+$/, { error: PORT_ERROR })
  .transform(Number)
  .pipe(
    z.number().min(1, { error: PORT_ERROR }).max(65535, { error: PORT_ERROR }),
  );

// Не z.coerce.boolean(): он превращает строку "false" в true
export const envBoolean = z.stringbool({
  error: 'Expected true/false, 1/0, yes/no or on/off',
});

export const envNodeEnv = z.enum(Environments, {
  error: `Expected one of: ${Object.values(Environments).join(', ')}`,
});

export function envString(example: string) {
  const error = `Required, example: ${example}`;
  return z.string({ error }).min(1, { error });
}

export function envList(example: string) {
  return z
    .string({ error: `Expected a comma-separated list, example: ${example}` })
    .transform(parseCommaSeparatedStringToArrayUtil);
}
