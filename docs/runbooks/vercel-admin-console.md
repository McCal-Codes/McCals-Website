# Vercel Admin Console Runbook

This runbook defines the architecture, rollout sequence, and guardrails for the internal admin app at `sites/mcc-cal-admin`.

## Goal

Create a separate internal Vercel project for operations and future editorial tooling without mixing those concerns into the public site at `sites/mcc-cal-vite`.

## Architecture

- Public site: `sites/mcc-cal-vite`
- Internal app: `sites/mcc-cal-admin`
- Protection model: allowlisted Sign in with Vercel inside the admin app
- Runtime model: Vercel Functions for admin-only reads and controlled actions
- Phase 1 posture: read-only-first

## Why a Separate Project

- Security boundaries stay clear.
- Admin-only environment variables do not live with the public site.
- Internal failures do not affect the public marketing site.
- Deployment protection can be configured independently.
- The admin app can grow into a fuller backoffice without bloating the public app.

## Phase 1 Scope

Ship these first:

- Admin dashboard and health surface
- Scheduling and bookings operations planning
- Manifest and cache operations planning
- Deployment and incident-response links
- Environment and project checklist

Do not ship these in Phase 1:

- Direct repository writes from Vercel Functions
- WYSIWYG editing
- Public-site admin routes
- Multi-role auth beyond the initial allowlisted operator gate

## Phase 2 Candidates

Only after Phase 1 is stable:

- Read-side bookings console backed by admin-only APIs
- Controlled booking cancel and reschedule flows
- Manifest refresh and cache action APIs with dry-run output
- Git-backed content publishing workflow

## Content Workflow Rule

The legacy standalone admin prototype wrote directly into repo files from a local Express server. That is acceptable as a local-only experiment, but it is not the production model for a Vercel-hosted admin app.

For content editing, choose one of:

1. Git-backed publishing
2. Headless CMS

Do not build production editorial tooling around direct filesystem mutation in Vercel Functions.

## Vercel Project Setup

1. Create a new Vercel project rooted at `sites/mcc-cal-admin`.
2. Assign an internal domain such as `admin.mcc-cal.com`.
3. Create a Sign in with Vercel app in the Integrations Console.
4. Register callback URLs for local and production auth flows.
5. Add only the environment variables needed by the admin app.
6. Keep the public site and admin app deploys independent.

## Minimum Auth Environment

- `VERCEL_CLIENT_ID`
- `VERCEL_CLIENT_SECRET`
- `ADMIN_SESSION_SECRET`
- `ADMIN_ALLOWED_EMAILS` or `ADMIN_ALLOWED_USERNAMES`
- `PUBLIC_SITE_URL` or `VITE_PUBLIC_SITE_URL`
- `PUBLIC_API_URL` or `VITE_PUBLIC_API_URL`

The allowlist is mandatory. Do not treat “any Vercel account” as sufficient for admin access.

## Local Workflow

```powershell
cd sites/mcc-cal-admin
cmd /c npm run dev
```

When this app grows Vercel Functions that need local execution:

```powershell
cd sites/mcc-cal-admin
cmd /c npm run dev:vercel
```

Use `dev:vercel` for authentication testing because the login callback and session endpoints are server-side.

## Legacy Admin Prototype

The old standalone prototype now belongs to archive-only history:

- archived root: `admin/_archived/legacy-standalone-blog-cms-2026-04-06/`

It remains useful for reference when planning future Git-backed editorial tooling, but it is not the active admin runtime.
