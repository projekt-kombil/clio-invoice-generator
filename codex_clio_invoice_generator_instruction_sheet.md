# Codex Instruction Sheet: Local Clio Custom Invoice Generator

## Purpose of this document

This document is a project brief for Codex. It explains the intended application, the agreed architecture, constraints, and development sequence.

Codex should **not begin implementing the application immediately**. Its first task should be to review this brief, inspect the eventual project environment, identify any missing decisions, and propose a development plan.

---

## Project summary

Build a small, local-only application that reads finalized billing data from Clio Manage and places that information into a custom printable invoice template.

The application is not intended to replace Clio billing. Clio remains the system of record for:

- clients
- matters
- time entries
- expenses
- bills
- taxes
- payments
- balances
- invoice numbering

The application only retrieves existing Clio data, formats it into a custom invoice design, and allows the user to save the result as a PDF using the browser's print function.

The final PDF will be sent manually to the client outside the application.

---

## Primary objective

The firm requires an invoice layout with a true two-column information section.

Example:

```text
CLIENT INFORMATION                         INVOICE INFORMATION

ABC Holdings Limited                       Invoice: INV-0048
P.O. Box 123                               Date: 10 July 2026
Port Moresby                               Due: 24 July 2026
Papua New Guinea                           Matter: Commercial Advice
```

Clio's current invoice template builder does not provide enough layout control for the firm's required design. The custom application will therefore render the invoice using HTML and CSS.

---

## Intended user

Only one person is expected to use the application.

The application should therefore remain local to one computer unless the requirements change later.

The user should not need:

- a hosted server
- a public domain
- a cloud database
- a multi-user authentication system
- automated email delivery
- automatic PDF generation on the server

The computer must still have internet access because the application will communicate with Clio's API.

---

## Expected user workflow

### Initial setup

1. The user starts the local application.
2. The user clicks **Connect to Clio**.
3. Clio displays the OAuth authorization screen.
4. The user approves the application.
5. The application securely stores the OAuth access and refresh tokens locally.
6. Future sessions should reconnect automatically by refreshing the token when necessary.

### Normal invoice workflow

1. The user creates and finalizes a bill in Clio.
2. The user opens the local invoice generator.
3. The user searches for the bill by:
   - invoice number
   - client name
   - matter number
   - matter description
4. The application displays matching bills.
5. The user opens the correct bill.
6. The application retrieves the finalized bill data from Clio.
7. The application renders the data in the firm's custom invoice template.
8. The user reviews the invoice.
9. The user clicks **Print / Save PDF**.
10. The browser print dialog opens.
11. The user saves the document as an A4 PDF.
12. The user sends the PDF manually through email.

---

## Application scope

### Required features

The first usable version should support:

- Clio OAuth connection
- secure local token storage
- automatic access-token refresh
- connection status
- bill search
- bill result list
- bill detail retrieval
- client information retrieval
- matter information retrieval
- bill line-item retrieval
- time and expense information where available
- tax, discounts, payments, totals, and balance where available
- custom A4 invoice preview
- two-column client and invoice information section
- print-friendly CSS
- browser-based Save as PDF
- firm logo
- firm contact details
- payment instructions
- footer text

### Optional later features

These may be considered after the first working version:

- recent invoices list
- editable attention line
- editable document-only note
- reusable invoice settings
- selectable invoice templates
- local audit log
- export filename suggestion
- backup and restore of local settings
- upload generated PDF back into Clio
- automatic email sending

Do not implement optional features until the core workflow is working.

---

## Explicit non-goals

The application should not:

- modify Clio's interface
- inject buttons or scripts into Clio pages
- scrape data from Clio's website
- create or alter bills in Clio
- independently calculate authoritative invoice totals
- replace Clio's accounting or billing functions
- automatically email clients in the initial version
- generate PDFs server-side in the initial version
- support multiple users in the initial version
- use public cloud hosting in the initial version
- store secrets in frontend code
- store OAuth tokens in browser localStorage

Clio remains the source of truth for all financial values.

---

## Current Clio setup

A Clio trial account has been created for development and testing.

A private Clio application has also been registered successfully in the Clio Developer Portal.

The local redirect URI is:

```text
http://127.0.0.1:3000/api/auth/clio/callback
```

Clio rejected `localhost`, so all local OAuth URLs should use `127.0.0.1`.

The selected permissions should remain read-only and limited to the resources required by the invoice generator.

Expected permissions include:

- API: Read
- Activities: Read
- Billing: Read
- Contacts: Read
- Matters: Read

All write permissions should remain disabled unless the project scope changes.

---

## Recommended technical stack

### Application

- Next.js
- React
- TypeScript
- App Router
- server-side route handlers
- CSS Grid and Flexbox
- print CSS

### Local storage

- SQLite
- `better-sqlite3` or another suitable local SQLite library

### Authentication

- Clio OAuth 2.0 Authorization Code flow
- server-side token exchange
- refresh-token support

### PDF workflow

Use browser printing:

```text
Invoice preview
→ Print
→ Save as PDF
```

Do not introduce Puppeteer, Playwright, Chromium automation, or server-side PDF generation unless browser printing proves insufficient.

---

## Suggested project structure

```text
clio-invoice-generator/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── clio/
│   │   │       ├── route.ts
│   │   │       └── callback/
│   │   │           └── route.ts
│   │   ├── bills/
│   │   └── settings/
│   ├── invoices/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── invoice/
│   └── ui/
├── lib/
│   ├── clio.ts
│   ├── clio-token-store.ts
│   ├── db.ts
│   ├── token-encryption.ts
│   └── validation.ts
├── data/
│   └── app.db
├── public/
│   └── logo.png
├── styles/
│   └── print.css
├── .env.local
└── .gitignore
```

Codex may propose improvements to this structure before implementation.

---

## Local environment configuration

The project should use a `.env.local` file for application credentials and encryption configuration.

Expected variables:

```env
CLIO_CLIENT_ID=replace_with_clio_client_id
CLIO_CLIENT_SECRET=replace_with_clio_client_secret
CLIO_REDIRECT_URI=http://127.0.0.1:3000/api/auth/clio/callback
CLIO_BASE_URL=replace_with_the_correct_clio_region_url
TOKEN_ENCRYPTION_KEY=replace_with_a_strong_random_key
```

Important:

- Do not prefix secrets with `NEXT_PUBLIC_`.
- Do not commit `.env.local`.
- Do not expose the Clio client secret to the browser.
- Confirm the correct regional Clio base URL from the account's actual login URL.

Recommended `.gitignore` entries:

```gitignore
.env.local
data/
*.db
*.db-journal
*.db-shm
*.db-wal
```

---

## Token storage requirements

The Clio client ID, client secret, redirect URI, regional base URL, and encryption key belong in `.env.local`.

OAuth access and refresh tokens should be stored in SQLite.

Because only one Clio connection is expected, a single-row token table is sufficient.

Suggested schema:

```sql
CREATE TABLE IF NOT EXISTS clio_tokens (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

Tokens should be encrypted before being written to SQLite.

A suitable approach is:

- AES-256-GCM
- random IV per encrypted value
- authentication tag stored with the ciphertext
- encryption key derived from `TOKEN_ENCRYPTION_KEY`

The encryption key must not be stored in the database.

The application should support:

- saving tokens
- loading tokens
- deleting tokens
- detecting expiry
- refreshing access tokens
- replacing stored tokens after refresh
- handling revoked or invalid refresh tokens gracefully

---

## Security requirements

Even though the app is local, treat Clio data as confidential legal information.

Minimum security requirements:

- bind the app to `127.0.0.1`, not all network interfaces
- keep all OAuth operations server-side
- validate OAuth `state`
- use HTTP-only cookies where cookies are used
- never log tokens
- never display the client secret
- encrypt stored OAuth tokens
- sanitize all data rendered into the invoice
- validate all API responses
- avoid storing unnecessary client data locally
- avoid persistent caching of invoice data unless required
- avoid exposing stack traces to the user
- handle API failures cleanly
- keep dependencies minimal
- do not commit the SQLite database

The app should retrieve Clio data on demand rather than maintaining a local copy of the firm's records.

---

## Data retrieval principles

The application should retrieve finalized Clio bill data and related records through the official Clio API.

Likely data requirements include:

### Bill

- bill ID
- invoice number
- issue date
- due date
- status
- subtotal
- tax
- discount
- total
- payments
- outstanding balance
- currency

### Client or contact

- display name
- company name
- individual name
- postal address
- email
- phone
- attention/contact person where relevant

### Matter

- matter number
- matter description
- responsible lawyer
- client reference
- custom fields if later required

### Bill line items

- date
- activity description
- staff member
- quantity or hours
- rate
- tax
- amount
- expense details

Codex must verify the exact Clio API endpoints and field names against the current official Clio documentation before implementing requests.

Do not assume API response shapes from memory.

The application should explicitly request required fields because Clio may return only a limited default field set.

Where possible, use collection endpoints and related-field expansion to reduce the number of API requests.

---

## Invoice design requirements

The invoice must be an A4 print-ready HTML document.

### Required layout characteristics

- firm logo and identity at the top
- clear invoice title
- two-column client and invoice information block
- matter information
- line-item table
- subtotal
- tax
- discounts where applicable
- payments where applicable
- total
- balance due
- payment instructions
- footer
- professional spacing
- predictable page breaks
- readable printed typography

### Example two-column structure

```html
<section class="invoice-summary">
  <div class="client-information">
    <!-- client fields -->
  </div>

  <div class="invoice-information">
    <!-- invoice fields -->
  </div>
</section>
```

```css
.invoice-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20mm;
}

.invoice-information {
  text-align: right;
}
```

### Print requirements

Expected print CSS:

```css
@page {
  size: A4;
  margin: 15mm;
}

@media print {
  .screen-only {
    display: none !important;
  }

  body {
    margin: 0;
  }
}
```

The final design must be tested in the actual browser the user will use.

Avoid fragile absolute positioning unless a specific design element requires it.

---

## Recommended development phases

Codex should not attempt to build the full application in one pass.

### Phase 1: Planning and validation

- inspect the project environment
- confirm Next.js version
- confirm Node.js version
- confirm the Clio region
- confirm registered redirect URI
- confirm available Clio app credentials
- review current official Clio OAuth documentation
- review current official Clio billing API documentation
- identify exact endpoints and fields
- propose the implementation plan
- identify unresolved questions

No full implementation should begin until this phase is reviewed.

### Phase 2: Project foundation

- create or inspect the Next.js project
- configure TypeScript
- bind development server to `127.0.0.1`
- configure environment validation
- create basic home page
- add clear error handling
- establish project conventions

### Phase 3: OAuth proof of concept

- create **Connect to Clio** action
- generate and validate OAuth `state`
- redirect to Clio
- receive callback
- exchange authorization code for tokens
- store encrypted tokens locally
- display connection status
- retrieve the current Clio user as the first API test

Success condition:

```text
Connect to Clio
→ approve access
→ return to local app
→ display connected user information
```

### Phase 4: Token lifecycle

- detect expired access token
- refresh using the refresh token
- update stored access and refresh tokens
- handle invalid or revoked authorization
- add disconnect/reconnect function

### Phase 5: Bill retrieval proof of concept

- retrieve a small list of bills
- display invoice number, client, date, total, and balance
- support basic search
- open a selected bill
- inspect and normalize API response data

No custom invoice styling is required yet.

### Phase 6: Data normalization

Create a stable internal invoice data model that separates Clio's API response shape from the UI.

Example concept:

```ts
type InvoiceDocumentData = {
  invoiceNumber: string;
  issuedAt: string;
  dueAt: string | null;
  client: {
    name: string;
    addressLines: string[];
  };
  matter: {
    number: string;
    description: string;
  };
  items: Array<{
    date: string | null;
    description: string;
    quantity: number | null;
    rate: number | null;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  payments: number;
  balance: number;
  currency: string;
};
```

Codex should refine this model only after confirming the actual Clio data.

### Phase 7: Invoice template

- build the A4 invoice preview
- implement the two-column section
- add line-item table
- add totals
- add payment instructions
- add logo and footer
- use mock normalized data first
- test page breaks
- test long client names
- test many line items
- test zero-tax and discounted bills

### Phase 8: Connect real bill data

- map retrieved Clio data into the normalized invoice model
- render the selected bill
- verify every financial value against Clio
- ensure no independent recalculation changes Clio's final values

### Phase 9: Print and PDF workflow

- add **Print / Save PDF** button
- hide controls in print view
- verify A4 margins
- verify background graphics
- test browser Save as PDF
- suggest a filename based on invoice number and client name

### Phase 10: Hardening

- user-friendly error messages
- connection recovery
- token revocation handling
- missing-field fallbacks
- malformed API response handling
- local backup guidance
- dependency review
- basic tests
- documentation for starting and using the app

---

## Testing data to create in the Clio trial

Before connecting the template, create several realistic test cases in Clio:

- individual client
- company client
- client with a long address
- client without a postal address
- matter with several time entries
- matter with expenses
- bill with tax
- bill without tax
- bill with a discount
- bill with partial payment
- bill with many line items
- bill spanning multiple printed pages
- bill with a long matter description

The application should be tested against all of these cases.

---

## Expected initial screens

### Home or connection screen

```text
Clio Invoice Generator

Connection status: Not connected

[Connect to Clio]
```

After connection:

```text
Clio Invoice Generator

Connected as: User Name

[View invoices]
[Disconnect]
```

### Invoice search screen

```text
Search invoices

[Invoice number, client, or matter]

Recent or matching bills:
INV-0048 — ABC Holdings — K4,850.00
INV-0047 — John Smith — K1,200.00
```

### Invoice preview screen

```text
[Back]
[Print / Save PDF]

-----------------------------------------
Custom A4 invoice preview
-----------------------------------------
```

---

## Local startup expectations

During development:

```bash
npm run dev -- --hostname 127.0.0.1
```

For normal local use later:

```bash
npm run build
npm start -- --hostname 127.0.0.1
```

Eventually, create a simple launcher so the user does not need to open VS Code or manually type commands.

Possible later launcher behavior:

1. start the Next.js server
2. wait until the server is available
3. open `http://127.0.0.1:3000`
4. keep the process running
5. stop cleanly when the user closes the launcher

Do not implement the launcher before the core application works.

---

## Guidance for Codex

When this brief is provided, Codex should:

1. Read the entire document.
2. Do not begin coding immediately.
3. Summarize its understanding of the project.
4. Inspect the repository and environment when access is available.
5. Identify missing information.
6. Verify current Clio API details using official documentation.
7. Propose a phased implementation plan.
8. Identify security and data-model risks.
9. Ask for approval before creating or modifying major files.
10. Work incrementally and keep each milestone testable.

Codex should avoid:

- generating a large application in one response
- inventing Clio API fields
- using outdated endpoint assumptions
- exposing secrets
- storing OAuth tokens in localStorage
- introducing unnecessary cloud infrastructure
- adding server-side PDF tooling prematurely
- recalculating authoritative billing totals
- making write requests to Clio
- expanding the scope beyond the agreed local invoice generator

---

## Immediate next milestone

The immediate next milestone is:

```text
Local Next.js application
→ Connect to Clio
→ complete OAuth callback
→ securely save tokens in SQLite
→ call the current-user endpoint
→ display Connected successfully
```

Do not begin bill retrieval or invoice-template work until this milestone is complete and verified.

---

## Decisions still to confirm

Before implementation, confirm:

1. The exact Clio regional base URL.
2. The version of Next.js to use.
3. Whether the project already exists or must be created.
4. The preferred styling approach:
   - plain CSS
   - CSS Modules
   - Tailwind CSS
5. The primary browser used for Save as PDF.
6. The firm's final invoice design and branding assets.
7. Whether custom document-only notes are required.
8. Whether invoice settings should be editable through a settings screen or hardcoded initially.
9. Whether the local app will run on Windows, Linux, or both.
10. Whether the SQLite database and encryption key need a backup procedure.

---

## Final product definition

A successful first version is a local, single-user application that:

- connects securely to Clio
- reads finalized bill data
- displays the correct client and matter information
- renders a professional two-column A4 invoice
- preserves Clio's financial values
- allows the user to save the invoice as a PDF
- requires no public hosting
- sends nothing automatically
- remains simple enough for routine office use
