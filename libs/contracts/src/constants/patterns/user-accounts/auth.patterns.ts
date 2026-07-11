export const AUTH_PATTERNS = {
  REGISTER_USER: 'auth.register-user',
  REGISTRATION_CONFIRMATION: 'auth.registration-confirmation',
  GET_ME: 'auth.get-me',
  FORGOT_PASSWORD: 'auth.forgot-password',
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  RESET_PASSWORD: 'auth.reset-password',
  REFRESH_TOKENS: 'auth.refresh-tokens',
  RESEND_EMAIL_CONFIRMATION_CODE: 'auth.reset-email-confirmation',
  CALLBACK_GOOGLE: 'auth.callback-google',
} as const;
