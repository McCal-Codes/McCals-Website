# McCal Admin Console

Internal admin application for McCal Media.

## Purpose

This app is the long-term replacement for the legacy root-level `admin/` prototype. It is designed as a separate Vercel project so admin tooling can be protected independently from the public site.

Phase 1 is intentionally read-only-first:

- dashboard and system health
- scheduling and booking operations planning
- manifest and cache operations planning
- publishing workflow guidance
- deployment and environment checklist

It does not attempt to write directly to repository files from Vercel Functions.

The intended production shape is:

- custom domain: `admin.mcc-cal.com`
- auth model: allowlisted Sign in with Vercel inside the app
- runtime boundary: separate Vercel project and separate admin-only environment variables

## Local development

```bash
cd sites/mcc-cal-admin
npm install
npm run dev
```

This app already has Vercel Functions (`api/`) for auth, bookings, and album upload/management. To test any of that locally, link the project once:

```bash
vercel link
```

Then run:

```bash
npm run dev:vercel
```

Use `npm run dev:vercel` for auth, bookings, or album work — it serves `/api` alongside the Vite dev server. Plain `npm run dev` is only for UI-only changes, since the login flow and every data-backed page depend on `api/` routes that plain Vite doesn't serve.

Copy `.env.example` to `.env` (picked up automatically by `vercel dev`) and fill in the required values before testing anything auth- or data-backed — without them the app just shows the setup checklist.

## Required Vercel setup

- Create a separate Vercel project for `sites/mcc-cal-admin`
- Point a custom domain such as `admin.mcc-cal.com` at that project
- Create a Sign in with Vercel app and register `https://admin.mcc-cal.com/api/auth/callback`
- Set `VERCEL_CLIENT_ID`, `VERCEL_CLIENT_SECRET`, `ADMIN_SESSION_SECRET`, and an explicit allowlist env
- Keep admin-only environment variables in this project, not in the public site

See `docs/runbooks/vercel-admin-console.md` for the architecture and rollout plan.
