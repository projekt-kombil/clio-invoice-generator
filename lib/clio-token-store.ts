import "server-only";

import { getDb } from "@/lib/db";
import { decryptToken, encryptToken } from "@/lib/token-encryption";

export type StoredClioTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  updatedAt: number;
};

type TokenRow = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  updated_at: number;
};

export function saveClioTokens(tokens: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}): void {
  const now = Date.now();

  getDb()
    .prepare(
      `
        INSERT INTO clio_tokens (
          id,
          access_token,
          refresh_token,
          expires_at,
          updated_at
        )
        VALUES (1, @accessToken, @refreshToken, @expiresAt, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          access_token = excluded.access_token,
          refresh_token = excluded.refresh_token,
          expires_at = excluded.expires_at,
          updated_at = excluded.updated_at
      `,
    )
    .run({
      accessToken: encryptToken(tokens.accessToken),
      refreshToken: encryptToken(tokens.refreshToken),
      expiresAt: tokens.expiresAt,
      updatedAt: now,
    });
}

export function loadClioTokens(): StoredClioTokens | null {
  const row = getDb()
    .prepare("SELECT access_token, refresh_token, expires_at, updated_at FROM clio_tokens WHERE id = 1")
    .get() as TokenRow | undefined;

  if (!row) {
    return null;
  }

  return {
    accessToken: decryptToken(row.access_token),
    refreshToken: decryptToken(row.refresh_token),
    expiresAt: row.expires_at,
    updatedAt: row.updated_at,
  };
}

export function deleteClioTokens(): void {
  getDb().prepare("DELETE FROM clio_tokens WHERE id = 1").run();
}
