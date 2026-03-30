import { IUser } from '@snaptix/common';

export type CreateUserDto = Pick<IUser, 'email' | 'username' | 'passwordHash'>;
