# Runbook: dev.mcc-cal.com (technical portfolio)

The technical product portfolio at `sites/mcc-cal-dev`. Separate Vercel project, separate
domain, separate design system. See `sites/mcc-cal-dev/README.md` for the app itself.

## Why it is a separate project

The photography app (`sites/mcc-cal-vite`) defines its design tokens in a global `:root` block
in `src/styles/globals.css`. Anything sharing that app inherits taupe, gold, and Fraunces. The
dev site is a different medium with a different system, so it gets its own build, its own CSP,
and its own deploy cadence. This mirrors `sites/mcc-cal-admin`.

## Blocking prerequisite: release the domain

**`dev.mcc-cal.com` is currently the photography site's preview/testing domain.** Pointing it
at the new project without releasing it first will break preview, and mis-scoping the
environment variable afterwards is what caused the July 2026 site-wide canonical-URL
regression (`docs/learned/audit-remediation-and-deploy-pipeline-pitfalls.md`, section 1).

Order of operations:

1. In the **photography** Vercel project, remove `dev.mcc-cal.com` from its domains.
2. Move preview to Vercel's generated preview URLs, or add `preview.mcc-cal.com`.
3. Update `VITE_SITE_URL` in that project's **Preview** environment to match.
   Production is unaffected: `vite.config.ts` and `scripts/generate-route-meta.js` both
   hardcode `https://mcc-cal.com` whenever `VERCEL_ENV === 'production'`, ignoring
   `VITE_SITE_URL`. Do not remove that guard.
4. Verify with `curl -s https://mcc-cal.com/about | grep canonical` before continuing.

## Create the project

1. New Vercel project, root directory `sites/mcc-cal-dev`.
2. Framework preset: Vite. Build command and output directory come from
   `sites/mcc-cal-dev/vercel.json` (`npm run build` → `dist`).
3. Add `dev.mcc-cal.com` as a domain.
4. No environment variables are required. The app has no API surface and fetches nothing
   at runtime.

## Redirects from the photography site

`/terranova` and `/roadmap` are permanent (308) cross-domain redirects to the new site. They
are declared in **both** `vercel.json` at the repo root and `sites/mcc-cal-vite/vercel.json`.
`src/vercel-config.test.ts` asserts the two files stay in sync, so edit both or the test fails.

## CSP

`font-src 'self'` and `img-src 'self' data:`. There is no CDN and no external font host. All
five woff2 files are vendored under `public/fonts/`. If a future change needs an external
origin, add it to `vercel.json` deliberately rather than loosening the policy.

## CI

`.github/workflows/vercel-deployment-checks.yml` covers `sites/mcc-cal-vite` only, matching
how `sites/mcc-cal-admin` is handled. Add a job for this app once it stabilizes. Until then,
run locally before pushing:

```bash
cd sites/mcc-cal-dev && npm run build && npm run lint
```
