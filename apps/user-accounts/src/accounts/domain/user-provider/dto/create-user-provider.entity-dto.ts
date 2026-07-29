import { UserProviderEntity } from '../user-provider.entity';

export type CreateUserProviderEntityDto = Pick<
  UserProviderEntity,
  'provider' | 'externalProviderId' | 'email' | 'user'
>;
