# Website Audit - 2026-07-02

## 1. Executive Summary

Overall condition: the production site is serving the expected public route set and has strong baseline route metadata coverage, Vercel headers, sitemap generation, Sentry wiring, Vercel Analytics, and route-level code splitting. The largest confirmed production issue is SEO-related: most checked production routes are served from `https://mcc-cal.com` but advertise canonical URLs on `https://dev.mcc-cal.com`.

Strongest parts:
- Public route definitions, sitemap generation, route HTML metadata generation, and deployment rewrites are centralized enough to audit.
- TypeScript strict mode is enabled and `npm run typecheck` passed.
- Production routes checked over HTTP returned expected 200, 308, or 404 status codes.
- Security headers are configured in Vercel, including CSP, HSTS, referrer policy, permissions policy, and nosniff.

Largest risks:
- Production canonical URLs point to the dev host for non-home routes.
- Local preview verification is unreliable in this Google Drive-backed checkout. Port `5173` was already serving another app titled `JobWasTaken`, and alternate Vite startup stalled before listening.
- Key source files for podcast and scheduling were intermittently blocked by Google Drive dataless placeholder behavior, limiting safe source inspection and patching.
- The current `/grab-a-coffee` flow depends on availability and booking APIs before showing its mail fallback, which is more complex than the simple contact-style flow requested.

Highest-value next action: fix production site URL resolution so production builds cannot emit `dev.mcc-cal.com` canonical, Open Graph, Twitter, or JSON-LD URLs.

What could not be verified:
- Full visual screenshots. Shell Playwright hung, Node REPL Playwright could import but had no browser installed, browser install hung, and Safari was not visible to the app-state bridge.
- Full local preview. `5173` was occupied by another app and `5184` did not start listening.
- Full lint, Vitest, and production build. These stalled in this Drive-backed checkout.
- Podcast player runtime console errors. Source and browser tooling were blocked before a safe reproduction could be captured.

## 2. Project Baseline

- Repository root: `/Users/mccal/Library/CloudStorage/GoogleDrive-wolftech029@gmail.com/My Drive/07 - Programing/McCals-Website`
- Active public app: `sites/mcc-cal-vite`
- Production URL checked: `https://mcc-cal.com`
- Primary purpose: photography portfolio, professional-services inquiry site, editorial/blog hub, and podcast surface.
- Primary audience: photography clients, editors, collaborators, readers, and podcast listeners.
- Package manager: npm, lockfile version 3 at root and app.
- Runtime requirement: root `package.json` declares Node `>=20.19.0`.
- Observed runtime: Node `v22.22.3`, npm `10.9.8`.
- Framework/build: Vite 6 with React 19 and `@vitejs/plugin-react`.
- Routing: React Router 6, route list driven by `STATIC_PAGE_ROUTES` plus legacy redirects.
- Styling: global CSS, CSS modules, Tailwind directives, and app-specific global files.
- Content/data: `pageSeoData.json`, public route config, blog static manifest, portfolio manifests, and page-local structured data.
- Image pipeline: public assets, portfolio manifests, generated social images, Vercel image config, and CDN-backed portfolio paths.
- Forms/API: contact, quote, schedule availability, and schedule booking handlers under `sites/mcc-cal-vite/api`.
- Analytics: `@vercel/analytics`, `@vercel/speed-insights`, custom `RouteAnalytics`, and `trackWebsiteEvent`.
- Error monitoring: Sentry browser and server helpers.
- Tests: Vitest unit/static tests and a Playwright critical-flow config.
- Deployment: Vercel config at root and app, with clean URLs, SPA rewrites, redirects, and headers.
- Environment variables: `.env.example` includes public `VITE_*` values plus server-only Resend, Google, Supabase, and Sentry credentials placeholders.

## 3. Verification Results

Install: skipped. Root and app `node_modules` were already present.

Lint: blocked. `npm run lint` started ESLint, then stayed silent for about 75 seconds and was stopped.

Typecheck: passed. `npm run typecheck` completed successfully with `tsc -b`.

Tests: blocked. `npm run test:run` started Vitest, then stayed silent for about 60 seconds and was stopped.

Production build: blocked. Normal `npm run build` stayed silent for about 60 seconds. Fallback `PUBLIC_COPY_TIMEOUT_MS=0 SYNC_SKIP_BLOG=true npm run build` reached manifest sync and then stalled after entering `tsc -b && node scripts/run-optional-node-script.js scripts/generate-social-images.js && vite build && node scripts/generate-route-meta.js`. Running the optional social image script alone timed out and skipped itself. Direct `npx vite build` also stayed silent and was stopped.

Local preview: blocked. `http://127.0.0.1:5173/` returned a page titled `JobWasTaken`, not McCal. A strict alternate Vite server on port `5184` never started listening.

Live-site inspection: partial pass. Production route HTTP checks completed for representative static routes, redirects, robots, sitemap, and web manifest. Full browser console inspection was blocked.

Accessibility tooling: blocked. Playwright shell import and `npx playwright` hung; Node REPL Playwright import worked, but Chromium was not installed and browser installation hung.

Performance tooling: not run. `npm run perf:budget` requires a successful local build, which was blocked.

Evidence files:
- `docs/audits/website-audit-2026-07-02-assets/http-route-results.json`

## 4. Prioritized Findings

ID: F-001
Title: Production canonical URLs point to the dev host
Category: SEO and deployment
Severity: High
Confidence: Confirmed
Status: Open
Affected files or routes: Production routes `/about`, `/contact-us`, `/request-a-quote`, `/featured-work`, `/letting-me-go`, `/journalism`, `/portraits`, `/nature`, `/events`, `/concerts`, `/blog`, `/authors`, `/authors/mccal`, `/podcast`, `/book-a-podcast`, `/grab-a-coffee`, `/faq`, `/projects`, `/terranova`, `/accessibility`, and `/policies-legal`
Evidence: HTTP route inspection of `https://mcc-cal.com/<route>` returned canonical values like `https://dev.mcc-cal.com/about` while the requested production URL was `https://mcc-cal.com/about`.
User impact: Search engines can consolidate authority toward the preview/dev host instead of the production site, and social/search tooling may treat production pages as duplicates of dev pages.
Technical cause: Production build or runtime URL resolution appears to be receiving `VITE_SITE_URL=https://dev.mcc-cal.com`, or route metadata generation is using a preview/dev site URL in production.
Recommended fix: Force production builds to resolve `VITE_SITE_URL` to `https://mcc-cal.com` when `VERCEL_ENV` or `VITE_VERCEL_ENV` is `production`, and update Vercel production environment variables to match. Local patch applied after this audit in `sites/mcc-cal-vite/vite.config.ts` and `sites/mcc-cal-vite/scripts/generate-route-meta.js`; production deploy and environment verification are still pending.
How to verify: Fetch `https://mcc-cal.com/about` and confirm canonical, `og:url`, social image URLs, and JSON-LD URLs use `https://mcc-cal.com`.
Estimated effort: Small to medium.
Regression risk: Medium, because preview environments should keep preview URLs if intentionally configured.

ID: F-002
Title: Local preview on the default port can silently audit the wrong app
Category: Deployment and developer experience
Severity: Medium
Confidence: Confirmed
Status: Open
Affected files or routes: Local preview workflow
Evidence: `curl` to `http://127.0.0.1:5173/` returned title `JobWasTaken` for every checked route.
User impact: Audits and screenshots can accidentally validate another app, hiding McCal regressions.
Technical cause: Port `5173` was already occupied, and the McCal Vite startup did not print a clear error or bind an alternate port during this run.
Recommended fix: Use strict ports for audit/dev scripts, document the expected port, and fail fast when the port is occupied.
How to verify: Start McCal on a strict known port and confirm the title and route content match McCal before browser testing.
Estimated effort: Small.
Regression risk: Low.

ID: F-003
Title: `/grab-a-coffee` is more complex than the desired simple scheduling flow
Category: UX and maintainability
Severity: Medium
Confidence: High confidence
Status: Open
Affected files or routes: `/grab-a-coffee`, `/schedule`, schedule API surface
Evidence: The inspected `grab-a-coffee.tsx` imports availability, calendar, time slot, booking form, confirmation view, timezone utilities, and `useBooking`. It only shows the direct `mailto:contact@mcc-cal.com` fallback after an availability failure that includes `Failed to load`.
User impact: A casual coffee request may fail before the user reaches a simple contact path, and the flow is heavier than the user's stated preference for the earlier widget-style mail flow.
Technical cause: The page is wired as a full booking workflow, not a lightweight request/contact flow.
Recommended fix: Replace or gate the coffee route with a simple email-backed request surface that keeps `/schedule`, `/grab-coffee`, and `/grab-a-coffee` working. Avoid calendar/API dependencies unless a future booking flow is explicitly needed.
How to verify: Visit `/schedule` and `/grab-a-coffee`; both should let users request a coffee without calendar API availability.
Estimated effort: Medium.
Regression risk: Medium, because it intentionally changes a user journey.

ID: F-004
Title: Podcast player errors need reproduction, but source/browser tooling is blocked
Category: Functional
Severity: Medium
Confidence: Needs verification
Status: Blocked
Affected files or routes: `/podcast`, podcast player components
Evidence: User reported player errors. Browser console capture was blocked, and key podcast files were Google Drive dataless placeholders during this run.
User impact: Podcast listeners may be unable to play episodes or may see broken player feedback.
Technical cause: Unknown. Likely candidates include remote media CORS, audio `play()` promise rejection, feed/media URL failures, state mismatch in the now-playing player, or Safari autoplay/media restrictions.
Recommended fix: Materialize the podcast source files, reproduce the player error in a real browser console, then patch the narrow failure path.
How to verify: Click the first playable episode on `/podcast`, observe no console errors, verify pause/play/seek state, and confirm graceful fallback when media cannot play.
Estimated effort: Small to medium after source hydration.
Regression risk: Medium.

ID: F-005
Title: Drive-backed dataless files block safe source review and patching
Category: Maintainability and production risk
Severity: Medium
Confidence: Confirmed
Status: Open
Affected files or routes: `podcast.tsx`, podcast component files, `grab-a-coffee.tsx`, Vite config, route metadata script during parts of the run
Evidence: `du` reported `0B` for files with nonzero logical sizes, and repeated `sed`, `rg`, `git grep`, and byte-level reads stalled or returned no content.
User impact: Reviews, audits, and fixes can be incomplete or unsafe if files are not fully available offline.
Technical cause: Google Drive file-provider placeholder behavior.
Recommended fix: Make the repo fully available offline before audit/fix runs, or use a non-Drive clone/worktree for implementation and verification.
How to verify: `du` should report nonzero disk usage for source files, and `sed`/`rg` should return promptly.
Estimated effort: Small operational change.
Regression risk: Low.

ID: F-006
Title: Full visual and accessibility audit could not be completed
Category: Accessibility and responsive UX
Severity: Medium
Confidence: Confirmed
Status: Blocked
Affected files or routes: Sitewide
Evidence: Shell Playwright hung, Node REPL Playwright lacked a browser executable, browser install hung, Safari window capture failed, and app-state capture returned `cgWindowNotFound`.
User impact: Responsive overlap, focus behavior, keyboard flow, and player/form visual defects may remain unverified.
Technical cause: Missing browser runtime plus local GUI automation visibility issues.
Recommended fix: Install a working Chromium/WebKit automation runtime or run the audit from a machine/profile with browser automation already configured.
How to verify: Capture screenshots at 320, 375, 480, 768, 1024, 1280, and 1440 widths, then run keyboard and axe checks.
Estimated effort: Small environment setup.
Regression risk: Low.

ID: F-007
Title: Preview domain strategy is not explicit
Category: Deployment
Severity: Opportunity
Confidence: Subjective recommendation
Status: Open
Affected files or routes: Preview deployments and Vercel domains
Evidence: Production metadata currently references `dev.mcc-cal.com`; user noted that `mcc-cal.dev` would be useful for preview.
User impact: A dedicated preview domain would make preview/prod separation clearer and reduce accidental dev-host leakage.
Technical cause: Preview and production host conventions are not strongly separated in code/environment.
Recommended fix: Consider using `mcc-cal.dev` or another explicitly preview-only domain for preview deployments, and reserve `mcc-cal.com` for production canonical metadata.
How to verify: Production canonical URLs use `mcc-cal.com`; preview deployments show preview banners and canonical policy intentionally documented.
Estimated effort: Small after domain/DNS decision.
Regression risk: Low to medium, depending on Vercel domain setup.

## 5. Route-by-Route Results

Production HTTP checks:

| Route | Status | Canonical | Notes |
| --- | ---: | --- | --- |
| `/` | 200 | `https://mcc-cal.com/` | Home canonical is correct. |
| `/about` | 200 | `https://dev.mcc-cal.com/about` | Wrong production canonical. |
| `/contact-us` | 200 | `https://dev.mcc-cal.com/contact-us` | Wrong production canonical. |
| `/request-a-quote` | 200 | `https://dev.mcc-cal.com/request-a-quote` | Wrong production canonical. |
| `/featured-work` | 200 | `https://dev.mcc-cal.com/featured-work` | Wrong production canonical. |
| `/letting-me-go` | 200 | `https://dev.mcc-cal.com/letting-me-go` | Wrong production canonical. |
| `/journalism` | 200 | `https://dev.mcc-cal.com/journalism` | Wrong production canonical. |
| `/portraits` | 200 | `https://dev.mcc-cal.com/portraits` | Wrong production canonical. |
| `/nature` | 200 | `https://dev.mcc-cal.com/nature` | Wrong production canonical. |
| `/events` | 200 | `https://dev.mcc-cal.com/events` | Wrong production canonical. |
| `/concerts` | 200 | `https://dev.mcc-cal.com/concerts` | Wrong production canonical. |
| `/blog` | 200 | `https://dev.mcc-cal.com/blog` | Wrong production canonical. |
| `/authors` | 200 | `https://dev.mcc-cal.com/authors` | Wrong production canonical. |
| `/authors/mccal` | 200 | `https://dev.mcc-cal.com/authors/mccal` | Wrong production canonical. |
| `/podcast` | 200 | `https://dev.mcc-cal.com/podcast` | Wrong production canonical; player errors need browser reproduction. |
| `/book-a-podcast` | 200 | `https://dev.mcc-cal.com/book-a-podcast` | Wrong production canonical. |
| `/grab-a-coffee` | 200 | `https://dev.mcc-cal.com/grab-a-coffee` | Wrong production canonical; flow is heavier than desired. |
| `/faq` | 200 | `https://dev.mcc-cal.com/faq` | Wrong production canonical. |
| `/projects` | 200 | `https://dev.mcc-cal.com/projects` | Wrong production canonical. |
| `/terranova` | 200 | `https://dev.mcc-cal.com/terranova` | Wrong production canonical. |
| `/accessibility` | 200 | `https://dev.mcc-cal.com/accessibility` | Wrong production canonical. |
| `/policies-legal` | 200 | `https://dev.mcc-cal.com/policies-legal` | Wrong production canonical. |
| `/contact` | 308 | `/contact-us` | Expected legacy redirect. |
| `/schedule` | 308 | `/grab-a-coffee` | Expected legacy redirect, but user wants simpler scheduling behavior. |
| `/grab-coffee` | 308 | `/grab-a-coffee` | Expected legacy redirect. |
| `/definitely-not-a-route` | 404 | none | Expected custom 404 status. |

Local HTTP checks were not valid site evidence because port `5173` served `JobWasTaken`.

## 6. Accessibility Results

Blockers:
- Full keyboard, focus, reduced-motion, zoom, and axe checks could not be completed because browser automation and screenshot capture were blocked.
- Local preview could not be trusted because the default port served another app.

Improvements to verify next:
- Mobile nav menu focus order and submenu semantics.
- Podcast player button state, range input accessible value, toast announcements, and media error messaging.
- Quote/contact validation messaging after empty submit.
- Scheduling/coffee request flow, especially if simplified to an email-backed form.

No full WCAG conformance claim is made from this audit.

## 7. Performance Results

Measured values: none. Lighthouse and browser performance tooling could not run.

Static observations:
- The app uses route-level lazy loading.
- Vercel headers include immutable caching for `/assets`, `/images`, and BFA thesis images.
- Optional social image generation timed out locally, and Vite build did not complete in this Drive-backed checkout.

Highest-value performance follow-up: run Lighthouse or WebPageTest against production after the canonical fix, then prioritize measured LCP/image issues over speculative micro-optimizations.

## 8. SEO and Metadata Matrix

| Route | Title | Meta description | Canonical | Open Graph | Primary heading | Indexability | Structured data | Issues |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Present | Present | Correct production host | Present | Not visible in raw HTML | Indexable header present | Present in source shell | None confirmed in HTTP metadata. |
| All checked non-home static routes | Present | Present | Wrong dev host | Present | Not visible in raw HTML | Indexable header present | Needs browser/source verification | F-001. |
| `/contact`, `/schedule`, `/grab-coffee` | Redirect | n/a | n/a | n/a | n/a | Redirected | n/a | Redirects behave as expected. |
| `/definitely-not-a-route` | Empty raw title | Empty | none | none | none | 404 | n/a | 404 status confirmed; rendered content not browser-verified. |
| `/robots.txt` | n/a | n/a | n/a | n/a | n/a | Allows site, disallows dev/API routes | n/a | Sitemap points to production. |
| `/sitemap.xml` | n/a | n/a | n/a | n/a | n/a | Available | n/a | Needs follow-up after canonical fix. |

## 9. Responsive and Browser Results

Actual viewport coverage: blocked. No reliable screenshots were produced.

Attempted coverage:
- Playwright shell route sweep and screenshot script.
- Node REPL Playwright route sweep.
- Safari screenshot via AppleScript.
- App-state screenshot capture.

Result: browser capture tooling was unavailable or blocked in this environment. Responsive and visual findings are therefore limited to code/source and HTTP evidence.

## 10. Security and Privacy Results

Confirmed strengths:
- Vercel config includes CSP, HSTS, referrer policy, permissions policy, nosniff, and frame protection.
- `.env.example` uses placeholders for privileged values and documents that `VITE_SENTRY_DSN` is public-safe.
- API routes appear separated from the Vite client surface.

Needs follow-up:
- API handler source inspection was partially blocked by Drive placeholder behavior.
- Contact, quote, and schedule validation should be verified with runtime tests.
- CSP should be rechecked after any podcast/player media source changes.

No exposed secret was confirmed in this audit.

## 11. Maintainability Assessment

Strengths:
- Route metadata has centralized data files and generation scripts.
- Navigation uses shared route config.
- Existing tests cover SEO, route config, Vercel config parity, and selected page/component behavior.

Risks:
- `VITE_SITE_URL` appears too easy to misconfigure across production and preview builds.
- Scheduling is heavier than the desired coffee-request use case.
- The Drive-backed checkout makes broad scans, source reads, and local builds unreliable.
- Legacy docs and active Vite app docs coexist, so audit scope must remain anchored to `sites/mcc-cal-vite`.

## 12. Recommended Implementation Plan

Immediate:
- Fix production URL resolution so production metadata cannot emit `dev.mcc-cal.com`.
- Verify production environment variables in Vercel and set production `VITE_SITE_URL=https://mcc-cal.com`.
- Add or update a focused test for production site URL resolution if the relevant files are materialized.

Next:
- Simplify `/grab-a-coffee` and `/schedule` to an email-backed request flow, preserving existing redirects and page metadata.
- Reproduce and fix podcast player errors once the source files are available locally.
- Add a strict local audit/dev port command so future audits fail fast instead of hitting another app.

Later:
- Consider `mcc-cal.dev` as a dedicated preview domain after checking domain availability and Vercel domain setup.
- Add automated axe/browser smoke checks after Playwright/Chromium is installed.
- Add measured production Lighthouse/Web Vitals reporting before making performance-specific changes.

## 13. Small High-Value Improvements

1. Production-site URL guard for canonical/social/JSON-LD metadata.
2. Vercel environment variable cleanup for production versus preview.
3. Dedicated preview domain convention, potentially `mcc-cal.dev`.
4. Strict local preview port for audits.
5. Simple coffee request page that works without calendar APIs.
6. Podcast player error reproduction test.
7. Podcast media error fallback UI.
8. Axe smoke test for homepage, podcast, quote, contact, and coffee routes.
9. Sitemap/canonical parity test against generated production HTML.
10. Make the repo fully available offline or move active implementation to a non-Drive clone.

## 14. Deferred or Rejected Changes

- Full redesign: not justified by current evidence.
- CMS migration: not justified.
- Dependency replacement: not justified.
- Destructive portfolio image compression: not justified.
- Broad schedule API removal: deferred until the desired simplified `/grab-a-coffee` behavior is explicitly scoped.
- Podcast player patch: deferred until the source file can be reliably inspected and the runtime error can be reproduced.

## 15. Post-Audit Fix Batch Applied

Files changed:
- `sites/mcc-cal-vite/vite.config.ts`
- `sites/mcc-cal-vite/scripts/generate-route-meta.js`

Summary:
- Production Vercel builds now inline `import.meta.env.VITE_SITE_URL` as `https://mcc-cal.com` whenever `VERCEL_ENV` or `VITE_VERCEL_ENV` is `production`.
- Build-time route metadata generation now resolves production `siteUrl` to `https://mcc-cal.com`, even if a stale production environment variable points at `https://dev.mcc-cal.com`.
- Preview and development environments can still use an explicit non-production `VITE_SITE_URL`, such as a future preview domain.

Verification:
- `node --check scripts/generate-route-meta.js` passed after the patch.
- Literal source checks confirmed the new `resolvedSiteUrl` and `resolveSiteUrl` guards are present.
- Full `npm run typecheck`, Vitest, Vite build, and Git diff verification were blocked by the same Drive-backed file-provider stalls documented above.

Rollback:
- Revert the two source-file edits above if preview/prod URL handling needs to return to raw `VITE_SITE_URL` behavior.
