import { IUserProvider } from '@snaptix/common';

export type CreateUserProviderEntityDto = Pick<
  IUserProvider,
  'provider' | 'externalProviderId' | 'email' | 'user'
>;
