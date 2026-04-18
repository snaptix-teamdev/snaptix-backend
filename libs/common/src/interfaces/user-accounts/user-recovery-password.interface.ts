export interface IUserRecoveryPassword {
  id: string;
  code: string;
  isCodeAlreadyUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
