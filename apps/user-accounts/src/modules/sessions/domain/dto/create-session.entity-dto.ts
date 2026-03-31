import { ISession } from '@snaptix/common';

export type CreateSessionEntityDto = Pick<
  ISession,
  'userId' | 'deviceName' | 'ip' | 'issuedAt' | 'expiresAt'
>;
