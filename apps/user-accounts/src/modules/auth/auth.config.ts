import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { zodConfigValidationUtility } from '@snaptix/common';

const authSchema = z.object({
  EMAIL_CONFIRMATION_CODE_TTL_MINUTES: z.coerce.number().min(1),
  PASSWORD_RESET_CODE_TTL_HOURS: z.coerce.number().min(1),

  ACCESS_TOKEN_SECRET: z.string().min(1),
  ACCESS_TOKEN_EXPIRE_IN: z.coerce.number().min(1),

  REFRESH_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_EXPIRE_IN: z.coerce.number().min(1),
});

type AuthSchemaType = z.infer<typeof authSchema>;

@Injectable()
export class AuthConfig implements AuthSchemaType {
  EMAIL_CONFIRMATION_CODE_TTL_MINUTES: number;
  PASSWORD_RESET_CODE_TTL_HOURS: number;

  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRE_IN: number;

  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRE_IN: number;

  constructor() {
    Object.assign(this, zodConfigValidationUtility(authSchema));
  }
}
