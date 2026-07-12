-- Migration number: 0001 	 2026-07-12T07:49:40.803Z
CREATE TABLE IF NOT EXISTS app_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'user'
        CHECK (role IN ('admin', 'user')),
    is_active INTEGER NOT NULL DEFAULT 1
        CHECK (is_active IN (0, 1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS clio_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    clio_user_id TEXT,
    clio_account_id TEXT,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES app_users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoice_download_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    clio_bill_id TEXT NOT NULL,
    clio_matter_id TEXT,
    invoice_number TEXT,
    downloaded_at INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,

    FOREIGN KEY (user_id)
        REFERENCES app_users(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS
    idx_invoice_download_user
ON invoice_download_logs(user_id);

CREATE INDEX IF NOT EXISTS
    idx_invoice_download_bill
ON invoice_download_logs(clio_bill_id);

CREATE INDEX IF NOT EXISTS
    idx_invoice_download_date
ON invoice_download_logs(downloaded_at);
