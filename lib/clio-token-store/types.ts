export type StoredClioTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  updatedAt: number;
};

export type ClioTokensToStore = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};
