import { IUser } from '@snaptix/common';

export const OAuthProviderType = {
  GOOGLE: 'GOOGLE',
  YANDEX: 'YANDEX',
  VK: 'VK',
  GITHUB: 'GITHUB',
} as const;
export type OAuthProviderType =
  (typeof OAuthProviderType)[keyof typeof OAuthProviderType];

export interface IUserProvider {
  id: string;
  provider: OAuthProviderType;
  externalProviderId: string;
  email: string;
  user: IUser;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
