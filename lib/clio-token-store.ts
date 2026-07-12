import "server-only";

import { decryptToken, encryptToken } from "@/lib/token-encryption";

const D1_BINDING = "jema_clio_db";
const DEFAULT_USER_ID = "default";
const DEFAULT_CONNECTION_ID = "default";

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

type D1TokenRow = {
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_expires_at: number | null;
  updated_at: number;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

function isD1Database(value: unknown): value is D1Database {
  return (
    typeof value === "object" &&
    value !== null &&
    "prepare" in value &&
    typeof value.prepare === "function"
  );
}

async function getCloudflareD1(): Promise<D1Database | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const binding = (env as unknown as Record<string, unknown>)[D1_BINDING];

    if (!binding) {
      throw new Error(`Missing Cloudflare D1 binding: ${D1_BINDING}.`);
    }

    if (!isD1Database(binding)) {
      throw new Error(`Cloudflare binding ${D1_BINDING} is not a D1 database.`);
    }

    return binding;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (
      message.includes("initOpenNextCloudflareForDev") ||
      message.includes("Cannot find package 'wrangler'") ||
      message.includes("Cannot find module 'wrangler'")
    ) {
      return null;
    }

    throw error;
  }
}

async function getLocalDb() {
  const { getDb } = await import("@/lib/db");
  return getDb();
}

async function saveClioTokensToD1(
  db: D1Database,
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  },
): Promise<void> {
  const now = Date.now();

  await db
    .prepare(
      `
        INSERT INTO app_users (
          id,
          email,
          display_name,
          role,
          is_active,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, 'admin', 1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          updated_at = excluded.updated_at
      `,
    )
    .bind(DEFAULT_USER_ID, "clio-oauth@local.app", "Clio OAuth User", now, now)
    .run();

  await db
    .prepare(
      `
        INSERT INTO clio_connections (
          id,
          user_id,
          access_token_encrypted,
          refresh_token_encrypted,
          token_expires_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          access_token_encrypted = excluded.access_token_encrypted,
          refresh_token_encrypted = excluded.refresh_token_encrypted,
          token_expires_at = excluded.token_expires_at,
          updated_at = excluded.updated_at
      `,
    )
    .bind(
      DEFAULT_CONNECTION_ID,
      DEFAULT_USER_ID,
      encryptToken(tokens.accessToken),
      encryptToken(tokens.refreshToken),
      tokens.expiresAt,
      now,
      now,
    )
    .run();
}

async function saveClioTokensLocally(tokens: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}): Promise<void> {
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

export async function saveClioTokens(tokens: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}): Promise<void> {
  const d1 = await getCloudflareD1();

  if (d1) {
    await saveClioTokensToD1(d1, tokens);
    return;
  }

  await saveClioTokensLocally(tokens);
}

async function loadClioTokensFromD1(db: D1Database): Promise<StoredClioTokens | null> {
  const row = await db
    .prepare(
      `
        SELECT
          access_token_encrypted,
          refresh_token_encrypted,
          token_expires_at,
          updated_at
        FROM clio_connections
        WHERE user_id = ?
        LIMIT 1
      `,
    )
    .bind(DEFAULT_USER_ID)
    .first<D1TokenRow>();

  if (!row || !row.refresh_token_encrypted || !row.token_expires_at) {
    return null;
  }

  return {
    accessToken: decryptToken(row.access_token_encrypted),
    refreshToken: decryptToken(row.refresh_token_encrypted),
    expiresAt: row.token_expires_at,
    updatedAt: row.updated_at,
  };
}

async function loadClioTokensLocally(): Promise<StoredClioTokens | null> {
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

export async function loadClioTokens(): Promise<StoredClioTokens | null> {
  const d1 = await getCloudflareD1();

  if (d1) {
    return loadClioTokensFromD1(d1);
  }

  return loadClioTokensLocally();
}

async function deleteClioTokensFromD1(db: D1Database): Promise<void> {
  await db
    .prepare("DELETE FROM clio_connections WHERE user_id = ?")
    .bind(DEFAULT_USER_ID)
    .run();
}

async function deleteClioTokensLocally(): Promise<void> {
  const db = await getLocalDb();
  db.prepare("DELETE FROM clio_tokens WHERE id = 1").run();
}

export async function deleteClioTokens(): Promise<void> {
  const d1 = await getCloudflareD1();

  if (d1) {
    await deleteClioTokensFromD1(d1);
    return;
  }

  await deleteClioTokensLocally();
}
