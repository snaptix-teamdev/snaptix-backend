export interface ISession {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string | null;
  issuedAt: Date;
  expiresAt: Date;
  createdAt: Date;
}
