# Data Retention and Deletion

This app is a Clio-connected invoice generator for Jema Lawyers. It should store
only the data needed to keep a user connected to Clio and keep a basic audit
trail of PDF downloads.

## Data Stored

### `app_users`

Stores one row per connected Clio user.

- `id`: internal app user id, formatted as `clio:{clio_user_id}`
- `email`: synthetic local identifier for the Clio user
- `display_name`: Clio user display name
- `role`, `is_active`, timestamps

### `clio_connections`

Stores one encrypted OAuth connection per connected Clio user.

- `user_id`: internal app user id
- `clio_user_id`: Clio user id
- encrypted access token
- encrypted refresh token
- token expiry and timestamps

Tokens are encrypted before storage. Disconnecting from Clio deletes the current
user's row from this table.

### `invoice_download_logs`

Stores one audit row per browser PDF download attempt.

- `user_id`
- Clio bill id
- Clio matter id, when available
- invoice number
- download timestamp
- IP address, when available
- user agent, when available

The app does not store generated PDF files, full invoice payloads, or cached
Clio bill details.

## Retention Policy

- Clio OAuth tokens should be kept only while the user remains connected.
- Clio OAuth tokens should be deleted immediately when the user disconnects.
- Invoice download logs should be retained only for the firm's audit and
  compliance needs.
- Recommended audit-log retention: 2 years, unless Jema Lawyers requires a
  longer legal, billing, or accounting retention period.

## Manual Admin Deletion

Run these commands from the project root.

Delete a user's Clio connection locally:

```bash
npx wrangler d1 execute jema_clio_db --local --command "DELETE FROM clio_connections WHERE user_id = 'clio:USER_ID';"
```

Delete a user's Clio connection remotely:

```bash
npx wrangler d1 execute jema_clio_db --remote --command "DELETE FROM clio_connections WHERE user_id = 'clio:USER_ID';"
```

Delete old local download logs:

```bash
npx wrangler d1 execute jema_clio_db --local --command "DELETE FROM invoice_download_logs WHERE downloaded_at < strftime('%s','now','-2 years') * 1000;"
```

Delete old remote download logs:

```bash
npx wrangler d1 execute jema_clio_db --remote --command "DELETE FROM invoice_download_logs WHERE downloaded_at < strftime('%s','now','-2 years') * 1000;"
```

Do not delete `app_users` rows that are still referenced by
`invoice_download_logs` unless the related audit logs are also intentionally
deleted.
