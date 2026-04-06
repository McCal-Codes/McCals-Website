# Legacy Standalone Blog CMS Archive

This archive preserves the old local-only admin prototype that served `admin/index.html` through a custom Express server and wrote directly into repository content files.

Archived on: `2026-04-06`

Why it was retired:

- It depended on a local Express runtime instead of the Vercel project model now used by the repo.
- It mixed UI, uploads, and direct filesystem writes in a way that does not map cleanly to a Vercel-hosted admin app.
- The new internal admin direction is a separate Vite app at `sites/mcc-cal-admin/`.

Archived contents:

- `server.js`
- `api.js`
- `index.html`
- `dist/`
