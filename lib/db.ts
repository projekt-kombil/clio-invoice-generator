import "server-only";

import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import path from "path";

let database: Database.Database | null = null;

function getDatabasePath(): string {
  return path.join(process.cwd(), "data", "app.db");
}

export function getDb(): Database.Database {
  if (database) {
    return database;
  }

  mkdirSync(path.dirname(getDatabasePath()), { recursive: true });

  database = new Database(getDatabasePath());
  database.pragma("journal_mode = WAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS clio_tokens (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  return database;
}
