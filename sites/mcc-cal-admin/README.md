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

If you later add Vercel Functions to this app and want to test them locally:

```bash
npm run dev:vercel
```

Use `npm run dev:vercel` for auth work. Plain `npm run dev` is only for UI-only changes because the login flow and session endpoints live in `api/`.

## Required Vercel setup

- Create a separate Vercel project for `sites/mcc-cal-admin`
- Point a custom domain such as `admin.mcc-cal.com` at that project
- Create a Sign in with Vercel app and register `https://admin.mcc-cal.com/api/auth/callback`
- Set `VERCEL_CLIENT_ID`, `VERCEL_CLIENT_SECRET`, `ADMIN_SESSION_SECRET`, and an explicit allowlist env
- Keep admin-only environment variables in this project, not in the public site

See `docs/runbooks/vercel-admin-console.md` for the architecture and rollout plan.
