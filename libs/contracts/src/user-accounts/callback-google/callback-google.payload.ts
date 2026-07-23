import { OAuthProviderType } from '@snaptix/common';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const callbackGooglePayloadSchema = z.object({
  email: z.string().email(),
  externalProviderId: z.string().min(1),
  provider: z.nativeEnum(OAuthProviderType),
  ip: z.string().nullable(),
  userAgent: z.string(),
});

export class CallbackGooglePayload extends createZodDto(
  callbackGooglePayloadSchema,
) {}
