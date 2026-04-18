import { ISession } from '@snaptix/common';

export type UpdateSessionEntityDto = Pick<
  ISession,
  'ip' | 'expiresAt' | 'issuedAt'
>;
