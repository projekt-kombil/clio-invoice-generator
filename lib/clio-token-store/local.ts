import { decryptToken, encryptToken } from "@/lib/token-encryption";
import type {
  ClioTokensToStore,
  StoredClioTokens,
} from "@/lib/clio-token-store/types";

type TokenRow = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  updated_at: number;
};

async function getLocalDb() {
  const { getDb } = await import("@/lib/db");
  return getDb();
}

export async function saveClioTokensLocally(
  tokens: ClioTokensToStore,
): Promise<void> {
  const db = await getLocalDb();
  const now = Date.now();

  db
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

export async function loadClioTokensLocally(): Promise<StoredClioTokens | null> {
  const db = await getLocalDb();
  const row = db
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

export async function deleteClioTokensLocally(): Promise<void> {
  const db = await getLocalDb();
  db.prepare("DELETE FROM clio_tokens WHERE id = 1").run();
}
