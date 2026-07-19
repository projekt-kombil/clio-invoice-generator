# Admin Runbook

Operational commands for the Clio Invoice Generator. Run commands from the
project root.

## Pre-Deploy Checklist

1. Confirm production `CLIO_REDIRECT_URI` points to the production callback URL.
2. Confirm the same redirect URI exists in the Clio Developer Portal.
3. Confirm PKCE is enabled in the Clio Developer Portal.
4. Confirm Clio API permissions are minimized:
   - keep: API Read, Activities Read, Billing Read, Contacts Read, Matters Read,
     Users Read
   - remove if present: Accounting Read, Payment distributions Read, Reporting
     Read
5. Apply remote migrations:

```bash
npm run db:migrate:remote
```

6. Build:

```bash
npm run build
```

7. Deploy:

```bash
npm run deploy
```

## Inspect Connected Clio Users

Local:

```bash
npx wrangler d1 execute jema_clio_db --local --command "SELECT id, user_id, clio_user_id, updated_at FROM clio_connections;"
```

Remote:

```bash
npx wrangler d1 execute jema_clio_db --remote --command "SELECT id, user_id, clio_user_id, updated_at FROM clio_connections;"
```

## Delete a User's Clio Connection

This removes the encrypted OAuth tokens for one connected Clio user. The user
can reconnect through the app.

Local:

```bash
npx wrangler d1 execute jema_clio_db --local --command "DELETE FROM clio_connections WHERE user_id = 'clio:USER_ID';"
```

Remote:

```bash
npx wrangler d1 execute jema_clio_db --remote --command "DELETE FROM clio_connections WHERE user_id = 'clio:USER_ID';"
```

## Delete Legacy Default Connection

Use only for old installs that still have the pre-per-user OAuth connection.

Local:

```bash
npx wrangler d1 execute jema_clio_db --local --command "DELETE FROM clio_connections WHERE user_id = 'default';"
```

Remote:

```bash
npx wrangler d1 execute jema_clio_db --remote --command "DELETE FROM clio_connections WHERE user_id = 'default';"
```

## Inspect Recent Download Logs

Local:

```bash
npx wrangler d1 execute jema_clio_db --local --command "SELECT user_id, clio_bill_id, invoice_number, downloaded_at FROM invoice_download_logs ORDER BY downloaded_at DESC LIMIT 10;"
```

Remote:

```bash
npx wrangler d1 execute jema_clio_db --remote --command "SELECT user_id, clio_bill_id, invoice_number, downloaded_at FROM invoice_download_logs ORDER BY downloaded_at DESC LIMIT 10;"
```

## Purge Old Download Logs

Recommended default retention is 2 years unless Jema Lawyers requires a longer
legal, billing, or accounting retention period.

Local:

```bash
npx wrangler d1 execute jema_clio_db --local --command "DELETE FROM invoice_download_logs WHERE downloaded_at < strftime('%s','now','-2 years') * 1000;"
```

Remote:

```bash
npx wrangler d1 execute jema_clio_db --remote --command "DELETE FROM invoice_download_logs WHERE downloaded_at < strftime('%s','now','-2 years') * 1000;"
```

## Verify Production After Deploy

1. Open the production URL.
2. Connect with a Clio user that has the needed read permissions.
3. Confirm bills load.
4. Select an invoice.
5. Download a PDF.
6. Confirm a per-user connection row exists.
7. Confirm a download log was written.

Do not commit `.env.local`, `.dev.vars`, OAuth tokens, Clio secrets, Cloudflare
tokens, or personal access tokens.
