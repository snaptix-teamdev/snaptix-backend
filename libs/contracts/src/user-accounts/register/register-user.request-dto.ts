import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { UserAccountsSchemas } from '@snaptix/contracts/schemas/user-accounts.schemas';

export const registerUserSchema = z.object({
  username: UserAccountsSchemas.username,

  email: z.string().trim().toLowerCase().email(),

  password: z
    .string()
    .trim()
    .min(6)
    .max(20)
    .regex(
      /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[0-9A-Za-z!"#$%&'()*+,\-./:;<=>?@[\\\]^_{|}~]+$/,
    ),
});

export class RegisterUserRequestDto extends createZodDto(registerUserSchema) {}
