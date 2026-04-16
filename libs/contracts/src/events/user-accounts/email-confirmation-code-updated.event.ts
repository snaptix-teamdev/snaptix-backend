export interface EmailConfirmationCodeUpdatedEvent {
  userId: string;
  username: string;
  email: string;
  emailConfirmationCode: string;
  emailConfirmationCodeTtlHours: number;
}
