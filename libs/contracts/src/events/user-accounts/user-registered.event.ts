export interface UserRegisteredEvent {
  userId: string;
  username: string;
  email: string;
  emailConfirmationCode: string;
}
