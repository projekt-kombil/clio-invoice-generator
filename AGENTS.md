<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Guardrails

- Read `codex_clio_invoice_generator_instruction_sheet.md` before making product or architecture changes.
- Keep the app local, single-user, and minimal unless the project brief changes.
- Use the Clio Manage API as the source of truth for all financial values.
- Keep Clio OAuth operations server-side.
- Do not expose Clio secrets to browser code or prefix them with `NEXT_PUBLIC_`.
- Do not store OAuth tokens in browser storage.
- Encrypt OAuth tokens before storing them in SQLite.
- Use read-only Clio permissions unless the project scope explicitly changes.
- Do not create, update, or delete Clio records.
- Verify current Clio API endpoints and fields against official Clio docs before implementing API requests.
