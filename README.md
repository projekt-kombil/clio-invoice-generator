# Clio Invoice Generator

Cloudflare Workers + D1 Clio Manage app for searching finalized Clio bills and rendering them into a custom Jema Lawyers invoice preview and browser-generated PDF.

## Local Setup

Create `.env.local` from `.env.example` and fill in the Clio private app credentials.
Use a strong random `TOKEN_ENCRYPTION_KEY` with at least 32 characters; for example:

```bash
openssl rand -base64 32
```

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

Enable PKCE for the Clio developer application; the OAuth flow sends a
`S256` code challenge and requires the matching verifier during callback.

`npm run dev` uses Next's dev server with OpenNext's Cloudflare binding initialization from `next.config.ts`, so local auth and token storage still use the local D1 binding. For a closer production runtime check, run:

```bash
npm run preview
```

## What It Does

- Connects to Clio Manage with the OAuth authorization-code flow.
- Stores encrypted OAuth tokens per connected Clio user in the configured D1 database.
- Searches read-only Clio bill data from the root invoice workspace.
- Shows loading states while connecting, searching, selecting bills, and rendering invoices.
- Renders selected bills into an on-screen invoice preview.
- Generates matching client-side PDFs from the same invoice data.
- Applies the Jema Lawyers firm branding, logo, payment details, and footer configuration from `lib/invoice-config.ts`.
- Maps Clio bill details, matter/contact context, line items, tax, payments, and account-statement data into the invoice document model.

## Invoice Template Notes

- The preview is the visual source of truth for the downloaded PDF.
- Presentation changes should be made in both the preview components under `components/invoice/preview` and the PDF components/styles under `components/invoice/pdf`.
- Service line item tables show the attorney column; expense tables omit it to give descriptions and amounts more room.
- Currency appears on rate, total, and grand-total labels, while subtotal and tax rows keep shorter labels.
- The workspace shows a skeleton invoice while a newly selected bill is loading and scrolls the preview pane back to the top.

## D1 Data

OAuth tokens are encrypted before being stored in the `jema_clio_db` D1 database. This project intentionally has no SQLite or local file-database fallback.
See `DATA_RETENTION.md` for the stored data, retention expectations, and manual deletion commands.
See `SECURITY.md` for vulnerability reporting, secret handling, and production security expectations.
See `ADMIN_RUNBOOK.md` for deployment checks and common D1 maintenance commands.

Apply migrations before local testing:

```bash
npm run db:migrate:local
```

Apply migrations to the remote D1 database before deploys that need schema changes:

```bash
npm run db:migrate:remote
```
