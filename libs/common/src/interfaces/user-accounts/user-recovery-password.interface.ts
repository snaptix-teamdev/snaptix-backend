export interface IUserRecoveryPassword {
  id: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
