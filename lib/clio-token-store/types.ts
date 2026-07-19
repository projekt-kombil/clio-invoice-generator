export type StoredClioTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  updatedAt: number;
};

export type ClioTokensToStore = {
  userId: string;
  clioUserId?: string;
  displayName?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};
