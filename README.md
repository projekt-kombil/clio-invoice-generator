# Clio Invoice Generator

Local-only private Clio Manage app for rendering finalized Clio bills into a custom printable invoice template.

## Local Setup

Create `.env.local` from `.env.example` and fill in the Clio private app credentials.

```bash
npm install
npm run dev:local
```

Open:

```text
http://127.0.0.1:3000
```

The Clio Developer Portal redirect URI must exactly match:

```text
http://127.0.0.1:3000/api/auth/clio/callback
```

## Current Milestone

Implemented:

- Clio OAuth authorization code flow
- HTTP-only OAuth state cookie
- encrypted SQLite token storage
- automatic access-token refresh
- current-user verification
- disconnect

Next milestone:

- bill search proof of concept using read-only Clio billing data

## Local Data

OAuth tokens are encrypted before being stored in `data/app.db`. The `data/` directory is ignored by Git.
