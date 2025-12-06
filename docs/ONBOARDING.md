# Onboarding — McCal Media Workspace

Welcome! This is a quick, zero-surprise setup guide for developing Squarespace widgets and the local demo site.

## Prerequisites

- Node.js 18+ (repo minimum is 16; 18 is recommended for Next.js and tooling)
- npm with network access to the public registry
- macOS/Linux/WSL (scripts are cross-platform; avoid PowerShell-only shells for shared scripts)

## First-time setup (5–7 minutes)

1. Install deps

```bash
npm install
```

2. Run a fast health check

```bash
npm run ai:preflight:short
```

3. Validate widgets (structure check only, no writes)

```bash
npm run validate:widgets
```

## Everyday commands (safe defaults)

- Start local demo server: `npm run dev`
- Validate widgets: `npm run validate:widgets`
- Generate manifests (dry, no writes): `npm run manifest:dry-run`
- Repo health sweep (clean + preflight + large-file scan): `npm run repo:health`

## Previewing widgets locally

- Run `npm run dev` then open http://localhost:3000 (serves `src/site/`).
- Widget HTML lives in `src/widgets/**/versions/` — copy/paste into a Squarespace Code Block for production.

## Manifests (safe usage)

- Use `npm run manifest:dry-run` before any write to confirm inputs.
- Full generation: `npm run manifest:generate` (writes manifests; follow git diff before committing).
- Watcher: `npm run watch:auto-manifest` (dev convenience; avoid committing stray manifest churn).

## What lives where

- Widgets: `src/widgets/` (self-contained HTML + per-widget README)
- Images/manifests: `src/images/Portfolios/**`
- Docs: `docs/` (standards, workflows, integrations)
- Scripts: `scripts/` (organized by manifest/watchers/utils/admin, with `_archived/` for unused)
- Local demo site: `src/site/`

## Secrets & env

- Copy `.env.example` to `.env` and fill required fields when using the API/worker flows.
- Optional values are marked; you can leave them blank for local widget-only work.

## If something looks off

- Run `npm run validate:widgets` for HTML shape issues.
- Run `npm run repo:health` for a quick sweep.
- Check `.github/copilot-instructions.md` and `docs/standards/workspace-organization.md` for guardrails.

Happy building! 🚀

## Dev subdomain (dev.mcc-cal.com)

- Point `dev.mcc-cal.com` CNAME to your dev host or Cloudflare Tunnel endpoint.
- Enable TLS (Cloudflare proxy OK) and add the subdomain to CORS/API allowlists in `.env`/`AUTH-SETUP-GUIDE.md`.
- Use this hostname for PR/staging previews and Playwright/axe targets when available.
