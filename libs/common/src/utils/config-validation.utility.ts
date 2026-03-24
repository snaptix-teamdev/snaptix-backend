import { validateSync } from 'class-validator';

export const configValidationUtility = {
  validateConfig: (configInstance: object) => {
    const errors = validateSync(configInstance);
    if (errors.length > 0) {
      const sortedMessages = errors
        .map((error) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const currentValue = error.value;
          const constraints = Object.values(error.constraints || {}).join(', ');
          return `\n${constraints} (currentValue: ${currentValue})`;
        })
        .join(';');
      throw new Error('Validation failed: ' + sortedMessages);
    }
  },

  convertToBoolean(value: string) {
    const trimmedValue = value?.trim();

    switch (trimmedValue) {
      case 'true':
        return true;
      case '1':
        return true;

      case 'false':
        return false;
      case '0':
        return false;
    }

    return null;
  },

  getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
    return Object.values(enumObj);
  },
};
