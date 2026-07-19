# Security Policy

This project is a Clio-connected invoice generator for Jema Lawyers. It handles
Clio OAuth tokens and Clio bill data, so security issues should be reported and
handled carefully.

## Reporting a Vulnerability

Report suspected vulnerabilities to the project owner or Jema Lawyers technical
contact. Do not include OAuth tokens, client data, invoice PDFs, or other
confidential matter information in the initial report.

Include:

- a short description of the issue
- affected route, feature, or file, if known
- reproduction steps that avoid real client data
- potential impact

Expected handling:

- acknowledge the report as soon as practical
- investigate and confirm impact
- patch and deploy according to severity
- rotate affected credentials or tokens when needed

## Current Security Controls

- Clio OAuth authorization-code flow with PKCE.
- Per-user Clio OAuth connections.
- Signed HTTP-only app session cookie.
- OAuth tokens encrypted at rest before storage in Cloudflare D1.
- Token refresh with stale-token cleanup.
- Same-origin checks for mutating app routes.
- Security headers configured in `next.config.ts`.
- Browser-generated PDFs are not stored by the app.
- Full Clio bill payloads are not cached or persisted.
- PDF download audit logs are stored in D1.
- Clio API field requests are explicit and minimized for invoice generation.

## Secrets

Never commit:

- `.env.local`
- `.dev.vars`
- Clio client secrets
- Cloudflare API tokens
- OAuth access or refresh tokens
- personal access tokens

If a secret is exposed, revoke or rotate it immediately and update the relevant
local, Cloudflare, or Clio configuration.

### Token Encryption Key Compromise

`TOKEN_ENCRYPTION_KEY` protects stored Clio OAuth tokens. If it is exposed,
replace it with a new strong value and delete all rows from `clio_connections`.
Existing users must reconnect with Clio because old encrypted tokens should no
longer be trusted or reused.

Keep `invoice_download_logs` unless there is a separate legal or operational
reason to delete audit history.

## Production Configuration

Production must use:

- a strong stable `TOKEN_ENCRYPTION_KEY`
- a production `CLIO_REDIRECT_URI`
- the same production redirect URI registered in the Clio Developer Portal
- PKCE enabled in the Clio Developer Portal
- least-needed Clio API permissions
- restricted access to Cloudflare, Wrangler, and D1 administration

## Data Retention

See `DATA_RETENTION.md` for stored data, retention expectations, and manual
deletion commands.
