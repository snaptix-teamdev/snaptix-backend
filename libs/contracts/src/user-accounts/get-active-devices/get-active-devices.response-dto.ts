import { ISession } from '@snaptix/common';

export class GetActiveDevicesResponseDto implements Pick<
  ISession,
  'ip' | 'deviceId'
> {
  ip: string | null;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  current: boolean;
}
