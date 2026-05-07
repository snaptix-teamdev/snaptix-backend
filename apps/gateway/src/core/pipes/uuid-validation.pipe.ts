import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationException } from 'nestjs-zod';

@Injectable()
export class UUIDValidationOrNotFoundPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    const field = metadata.data ?? 'value';
    const result = z
      .object({ [field]: z.string().uuid() })
      .safeParse({ [field]: value as unknown });

    if (!result.success) {
      throw new ZodValidationException(result.error);
    }
    return value;
  }
}
