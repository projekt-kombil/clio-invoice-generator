import { decryptToken, encryptToken } from "@/lib/token-encryption";
import type {
  ClioTokensToStore,
  StoredClioTokens,
} from "@/lib/clio-token-store/types";

const D1_BINDING = "jema_clio_db";

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

export type D1Database = {
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

function getD1SetupMessage(detail?: string): string {
  const suffix = detail ? `\n\nOriginal error: ${detail}` : "";

  return (
    `Missing Cloudflare D1 binding: ${D1_BINDING}.\n\n` +
    "This app is Cloudflare Workers + D1 only. Run it through OpenNext/Cloudflare local dev or preview so Wrangler provides the D1 binding, and apply migrations with Wrangler before testing auth flows." +
    suffix
  );
}

export async function getCloudflareD1(): Promise<D1Database> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const binding = (env as unknown as Record<string, unknown>)[D1_BINDING];

    if (!binding) {
      throw new Error(getD1SetupMessage());
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
      throw new Error(getD1SetupMessage(message));
    }

    throw error;
  }
}

export async function saveClioTokensToD1(
  db: D1Database,
  tokens: ClioTokensToStore,
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
          display_name = excluded.display_name,
          updated_at = excluded.updated_at
      `,
    )
    .bind(
      tokens.userId,
      `${tokens.userId}@clio.local`,
      tokens.displayName ?? tokens.userId,
      now,
      now,
    )
    .run();

  await db
    .prepare(
      `
        INSERT INTO clio_connections (
          id,
          user_id,
          clio_user_id,
          access_token_encrypted,
          refresh_token_encrypted,
          token_expires_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          clio_user_id = excluded.clio_user_id,
          access_token_encrypted = excluded.access_token_encrypted,
          refresh_token_encrypted = excluded.refresh_token_encrypted,
          token_expires_at = excluded.token_expires_at,
          updated_at = excluded.updated_at
      `,
    )
    .bind(
      tokens.userId,
      tokens.userId,
      tokens.clioUserId ?? tokens.userId,
      encryptToken(tokens.accessToken),
      encryptToken(tokens.refreshToken),
      tokens.expiresAt,
      now,
      now,
    )
    .run();
}

export async function loadClioTokensFromD1(
  db: D1Database,
  userId: string,
): Promise<StoredClioTokens | null> {
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
    .bind(userId)
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

export async function deleteClioTokensFromD1(
  db: D1Database,
  userId: string,
): Promise<void> {
  await db
    .prepare("DELETE FROM clio_connections WHERE user_id = ?")
    .bind(userId)
    .run();
}
