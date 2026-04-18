import { ZodType } from 'zod';

export function zodConfigValidationUtility<T extends object>(
  schema: ZodType<T>,
): T {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      result.error.issues
        .map(
          (issue) =>
            `\nEnvironment: ${issue.path[0].toString()}. ${issue.message}. Current value: ${process.env[String(issue.path[0])]}`,
        )
        .join('\n'),
    );
  }

  return result.data;
}
