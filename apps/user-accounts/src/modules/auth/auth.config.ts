import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { zodConfigValidationUtility } from '@snaptix/common';

const authSchema = z.object({
  EMAIL_CONFIRMATION_CODE_TTL_MINUTES: z.coerce.number().min(1),
  PASSWORD_RESET_CODE_TTL_HOURS: z.coerce.number().min(1),
});

type AuthSchemaType = z.infer<typeof authSchema>;

@Injectable()
export class AuthConfig implements AuthSchemaType {
  EMAIL_CONFIRMATION_CODE_TTL_MINUTES: number;
  PASSWORD_RESET_CODE_TTL_HOURS: number;

  constructor() {
    Object.assign(this, zodConfigValidationUtility(authSchema));
  }
}
