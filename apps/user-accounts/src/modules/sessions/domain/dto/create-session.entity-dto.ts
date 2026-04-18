import { ISession } from '@snaptix/common';

export type CreateSessionEntityDto = Pick<
  ISession,
  'userId' | 'deviceId' | 'deviceName' | 'ip' | 'issuedAt' | 'expiresAt'
>;
