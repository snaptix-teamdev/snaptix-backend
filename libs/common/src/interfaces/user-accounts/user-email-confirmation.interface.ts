export interface IUserEmailConfirmation {
  id: string;
  code: string;
  isVerified: boolean;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
