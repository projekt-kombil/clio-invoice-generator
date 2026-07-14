# Clio Invoice Generator

Cloudflare Workers + D1 Clio Manage app for rendering finalized Clio bills into a custom printable invoice template.

## Local Setup

Create `.env.local` from `.env.example` and fill in the Clio private app credentials.

```bash
npm install
npm run db:migrate:local
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

The Clio Developer Portal redirect URI must exactly match:

```text
http://127.0.0.1:3000/api/auth/clio/callback
```

`npm run dev` uses Next's dev server with OpenNext's Cloudflare binding initialization from `next.config.ts`, so local auth and token storage still use the local D1 binding. For a closer production runtime check, run:

```bash
npm run preview
```

## Current Milestone

Implemented:

- Clio OAuth authorization code flow
- HTTP-only OAuth state cookie
- encrypted D1 token storage
- automatic access-token refresh
- current-user verification
- disconnect

Next milestone:

- bill search proof of concept using read-only Clio billing data

## D1 Data

OAuth tokens are encrypted before being stored in the `jema_clio_db` D1 database. This project intentionally has no SQLite or local file-database fallback.

Apply migrations before local testing:

```bash
npm run db:migrate:local
```

Apply migrations to the remote D1 database before deploys that need schema changes:

```bash
npm run db:migrate:remote
```
