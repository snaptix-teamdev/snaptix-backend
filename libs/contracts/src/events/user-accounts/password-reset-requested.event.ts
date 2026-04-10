export interface PasswordResetRequestedEvent {
  userId: string;
  username: string;
  email: string;
  passwordResetCode: string;
  passwordResetCodeTtlHours: number;
}
