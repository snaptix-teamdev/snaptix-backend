export class AccessTokenPayloadDto {
  userId: string;
  lastActiveDate: string;
  exp: number;
}

export class RefreshTokenPayloadDto {
  userId: string;
  deviceId: string;
  lastActiveDate: string;
  exp: number;
}

export class AccessAndRefreshTokensDto {
  accessToken: string;
  refreshToken: string;
}
