# Self-hosted Next.js — Quick start

Quick notes for running the self-hosted Next.js app included in this repository.

Prerequisites
- Node.js 18+ recommended (top-level repo supports Node >=16; Next.js 15 works best on Node 18+).
- Network access to the npm registry to install dependencies.

Install

```bash
cd sites/self-hosted-nextjs
npm install
```

Development (fast iteration)

```bash
cd sites/self-hosted-nextjs
npm run dev
# Open http://localhost:3000
```

Build & Serve (production)

```bash
cd sites/self-hosted-nextjs
npm run build
npm run start
# This serves the production build (next start)
```

Static export (optional)

If you want a static `out/` folder that the repo dev-server can serve via `/?root=site`:

```bash
cd sites/self-hosted-nextjs
npm run build
npx next export -o out
# The exported static site will be available in `sites/self-hosted-nextjs/out/`
```

Troubleshooting
- If port 3000 is in use, pass a port to dev/start: `npx next dev -p 3001` or `npx next start -p 3001`.
- If you see build errors, check Node version and TypeScript diagnostics (if enabled).
- If you want the repo-level helper to export and serve the site automatically, run the top-level command from the repo root:

```bash
npm run site:export
# (runs install/build/export in sites/self-hosted-nextjs)
```

Questions or issues? Paste the build output and I can help debug.
