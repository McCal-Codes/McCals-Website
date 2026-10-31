# Website Audit — 2026-07-04

**Scope (by request):** Frontend, accessibility, UX, technical SEO, performance, security, content, maintainability, and deployment audit of McCal Media (mcc-cal.com), a photography portfolio/business site.
**Repository:** `McCals-Website` monorepo, branch `feature/supabase-image-storage` (audited as checked out — includes WIP Supabase-backed hero-slide functionality not yet live in production).
**Primary audience (as confirmed by site owner):** prospective photography clients — event venues, publications/editors, individuals seeking portraits/headshots, concert promoters.
**Method:** live HTTP inspection of `https://mcc-cal.com`, direct source reading, real verification-command execution (lint/typecheck/test/build/audit), and two scoped subagent passes (maintainability, partial content). No code was changed. This report supersedes an earlier, largely-blocked partial pass at `docs/audits/website-audit-2026-07-02.md`, which independently found the same #1 finding below (production canonical URLs pointing to the dev host) but could not get lint, tests, or a build to complete in this environment. This pass did get all of those to run.

---

## 1. Executive Summary

**Overall condition:** This is a mature, well-built codebase (TypeScript strict mode, config-driven routing, real SEO/JSON-LD infrastructure, Sentry + Vercel Analytics wired and confirmed mounted, solid CSP/security headers, a genuinely well-validated contact API). But **the live production site currently ships two confirmed, user-facing defects that undercut a lot of that groundwork**: canonical/Open Graph URLs pointing at the wrong domain on almost every page, and a real linked page that hard-404s. Neither is cosmetic — both directly affect how the site is discovered and shared, which matters a great deal for a client-acquisition photography business.

**Strongest parts:**
- TypeScript strict mode passes cleanly; no `any`/`@ts-ignore` sprawl found.
- Centralized, config-driven SEO metadata (`pageSeoData.json`, 22 entries) with well-sized titles/descriptions (none exceed search-snippet limits) and real JSON-LD (WebSite/Person/Organization/Service/ImageObject schemas).
- Production security headers (CSP, HSTS, Permissions-Policy, X-Frame-Options, nosniff) are live and correctly configured.
- The `/api/contact` handler is genuinely well-built: Zod validation, rate limiting, honeypot, timing check, and no HTML-injection risk.
- `PortfolioLightbox` modal is a textbook-correct implementation: `role="dialog"`, `aria-modal`, full keyboard focus trap, and focus restoration to the trigger element.
- Vercel Analytics and Sentry are wired **and actually mounted** in `Layout.tsx` (confirmed, not just imported).

**Largest risks:**
1. **(Critical)** Every production route except the homepage serves a canonical URL and Open Graph tags pointing to `https://dev.mcc-cal.com` instead of `https://mcc-cal.com`. This breaks social-share previews and sends the wrong canonical signal to search engines on ~21 of 22 static pages.
2. **(High)** `/roadmap` — a real page linked from the site footer — returns a bare Vercel platform 404 on direct load, refresh, or share. It has no static prerendered file and the SPA-fallback rewrite isn't catching it in production.
3. **(High)** The repository's own `npm run lint` currently fails (exit code 1) due to a parser/syntax mismatch, which would break the CI lint gate.
4. **(Medium)** A CI test (`vercel-config.test.ts`) is actively failing because the root and app-level `vercel.json` files have drifted (missing `images.mcc-cal.com` in the CSP/image config at root).
5. **(Medium)** Several Supabase tables used by live code (`hero_slides`, `contact_submissions`, `testimonials`) have no tracked migration — only `portfolio_images` does.

**Highest-value next action:** fix `resolveSiteUrl()` in `scripts/generate-route-meta.js` / the Vercel Production environment variable driving it, so production builds cannot emit `dev.mcc-cal.com` URLs. This is a same-day fix with site-wide impact.

**What could not be verified in this environment:**
- Real Lighthouse/Core Web Vitals scores — no headless Chrome binary is available in this sandbox, and installing a browser was judged out of scope for a read-only audit. Performance findings below are based on direct code/config/HTTP-header review only, not measured scores.
- A full interactive local-dev-server pass (responsive breakpoints at all 7 requested widths, keyboard-only walkthrough, form fill-and-submit, dark/light toggle) — the repo's Google Drive-hosted checkout made every build/test/lint command 10–100x slower than normal (a full production build took over 2 hours end-to-end; the same issue was flagged in a prior audit, `docs/AUDIT-REPORT-2026-06-14.md`, finding H2), which consumed the practical time budget for this pass. Live production was inspected directly via HTTP instead, which is arguably more representative of what real visitors experience.
- Cross-browser testing (Firefox/Safari engines) — only Chromium-equivalent HTTP/DOM-level checks were performed.
- Full WCAG pass on every page/component — Nav, Footer, Layout, and PortfolioLightbox were read in full; ContactForm/QuoteRequestForm labeling and color-contrast values were not independently re-verified beyond what a content-focused subagent pass reported in passing.
- Root cause of the `dev.mcc-cal.com` bug is "High confidence," not fully "Confirmed" — the code path is clear, but confirming *why* it fires in production requires access to the Vercel project's environment-variable dashboard, which this audit did not have.

---

## 2. Project Baseline

- **Repository root:** `McCals-Website` (monorepo). Active production app: `sites/mcc-cal-vite`.
- **Framework:** Vite 6.4.2 + React 19.0.0 + TypeScript 5.6 (strict mode) + React Router DOM 6.28 (client-side SPA, no SSR).
- **Package manager:** npm (lockfile v3), Node `>=20.19.0` required, observed `v20.19.4`.
- **Styling:** Tailwind CSS v4 + CSS Modules, `darkMode: 'media'`.
- **Routing:** config-driven via `src/config/public-routes.js` (`STATIC_PAGE_ROUTES`, 22 entries) and `src/config/site-navigation.ts`; lazy-loaded routes; build-time static HTML generation per route (`scripts/generate-route-meta.js`) for SEO.
- **Content:** `pageSeoData.json` (metadata), Markdown-based blog (`src/content/blog/`, compiled to JSON + prerendered per-post static HTML), portfolio manifests generated from `src/images/Portfolios/` and published to CDN.
- **Images:** Cloudflare R2 custom domain `images.mcc-cal.com` is the live image host (migrated off Supabase Storage). Current branch adds a WIP `portfolio_images` Supabase table for metadata and a Supabase-backed hero-slide system (`hero_slides` table via raw REST fetch) with a hardcoded fallback.
- **Forms/API:** Express-style Vercel functions in `sites/mcc-cal-vite/api/` — `contact.js`, `quote.js`, `schedule/*.js` — using Zod validation (`api/_lib/validation.js`) and custom rate limiting (`api/_lib/rate-limit.js`).
- **Analytics/monitoring:** `@vercel/analytics` + `@vercel/speed-insights` (confirmed mounted in `Layout.tsx`), Sentry (`@sentry/react`/`@sentry/node`) with source-map upload on build.
- **Testing/linting:** Vitest (jsdom) + Playwright (Chromium-only smoke tests) + ESLint (flat config `eslint.config.mjs`, plus a legacy `.eslintrc.json` that is dead per the prior audit) + `lighthouse@12.6.1` devDependency.
- **Deployment:** Vercel. Two `vercel.json` files exist (root and `sites/mcc-cal-vite/`) — see Finding S-01, they have drifted. Root config drives `installCommand`/`buildCommand`/`outputDirectory` pointing into `sites/mcc-cal-vite`.
- **Env vars:** `.env.example` (root + app) document Supabase, Sentry, Resend, Mailchimp, Cloudflare, and Google API variables with a token-rotation schedule. `.env.local` is correctly gitignored; the tracked `sites/mcc-cal-vite/.env.production` contains only a non-secret build flag.
- **Prior audit on file:** `docs/AUDIT-REPORT-2026-06-14.md` already covered repo/tooling health (git history bloat from portfolio images, Google Drive checkout fragility, workflow sprawl, config drift) — not re-derived here except where it directly explains a new finding (build/test slowness).

---

## 3. Verification Results

```
Install:            Already present; had to force-reinstall the `lighthouse` package specifically
                     after Google Drive sync had dropped locale files from node_modules (env-specific,
                     not an app defect) — see D-01.
Lint (root):         FAILED — exit code 1. See F-03.
Typecheck (app):     PASSED — `tsc -b` clean, no errors.
Tests (app):         3 FAILED / 46 passed of 49 tests across 17 files (Vitest, --coverage).
                     See F-05 (2 API timeout failures) and F-04 (vercel-config parity failure).
                     Full run took 698s — dominated by Drive I/O, not test logic.
Production build:    Completed with exit code 0 after an exceptionally long `tsc -b` phase (~2 hours,
                     versus ~12 minutes on an earlier attempt earlier the same day) — Drive I/O
                     variance, not a code regression. `vite build` itself and `generate-route-meta.js`
                     ("Generated route meta for 30 pages") ran to completion. HOWEVER: the build's
                     custom `copy-public-skip-one-nation-divided` Vite plugin (added specifically to
                     work around Google Drive file-locking) reported 90 public assets it "could not
                     copy" into dist/ — including robots.txt, every OG/social share image, several
                     fonts, the resume/CV PDF downloads, and multiple homepage hero images. Confirmed
                     dist/robots.txt is genuinely absent from this local build output. This is a
                     LOCAL-ONLY artifact of the Drive-synced checkout (see D-02) — production itself
                     was independently confirmed via live curl to correctly serve robots.txt and OG
                     images, because Vercel's actual build runs in its own cloud environment against a
                     fresh GitHub checkout, never touching this local folder. Local build output in
                     this environment should not be trusted as representative of what ships to
                     production.
npm audit (root):     0 vulnerabilities.
npm audit (app, prod): 8 moderate vulnerabilities. See F-06.
Live-site inspection: Extensive direct HTTP inspection of https://mcc-cal.com — response headers,
                     robots.txt, sitemap.xml, per-route canonical/OG tags, direct-load status codes
                     for representative and edge-case routes. High confidence, hands-on evidence.
Accessibility tooling: No automated axe-core/Lighthouse run (no headless Chrome available in this
                     environment). Manual code review of Nav/Footer/Layout/PortfolioLightbox performed
                     instead.
Performance tooling:  Lighthouse could not run — "No Chrome installations found" in this sandbox.
                     No scores are reported or invented; performance findings are based on direct
                     review of caching headers, image/code-splitting strategy, and bundle config.
```

---

## 4. Prioritized Findings

```
ID: F-01
Title: Production canonical URLs and Open Graph tags point to dev.mcc-cal.com on every route except the homepage
Category: SEO / Deployment
Severity: Critical
Confidence: Confirmed (symptom via live HTTP checks) / High confidence (root cause)
Status: Open
Affected files or routes: Live at https://mcc-cal.com/{about,journalism,concerts,contact-us,faq,blog,
policies-legal,portraits,...} — verified on 8+ distinct routes, all showing the same pattern.
Root cause: sites/mcc-cal-vite/scripts/generate-route-meta.js:11-18 (resolveSiteUrl) and :110
(buildRouteMetaEntries filters out route.path !== '/', so index.html/homepage never gets rewritten
and keeps its correct hardcoded value — this is why only the homepage is unaffected).
Evidence:
  curl -s https://mcc-cal.com/about | grep canonical
  → <link rel="canonical" href="https://dev.mcc-cal.com/about" />
  Same pattern confirmed on /concerts, /contact-us, /faq, /blog, /policies-legal, /portraits, /journalism.
  resolveSiteUrl() returns the correct hardcoded 'https://mcc-cal.com' only when
  (env.VERCEL_ENV || env.VITE_VERCEL_ENV) === 'production'; otherwise it falls back to
  env.VITE_SITE_URL || 'https://mcc-cal.com'. Since production output shows dev.mcc-cal.com, either
  VERCEL_ENV isn't resolving to 'production' at build time, or (more likely) a
  VITE_SITE_URL=https://dev.mcc-cal.com variable is scoped into the Vercel Production environment
  (cannot be confirmed without Vercel dashboard access — flagged as the leading hypothesis).
User impact: Anyone sharing a link to any page but the homepage on Facebook/Twitter/Slack/iMessage
gets a preview card pointing at dev.mcc-cal.com (which may be inaccessible or behave differently).
Search engines are told the canonical version of every inner page lives on a different domain,
which can suppress indexing/ranking of the production URL.
Recommended fix: Audit the Vercel Production environment variables for VITE_SITE_URL and correct/remove
it, and/or harden resolveSiteUrl() to ignore VITE_SITE_URL entirely when running on Vercel (trust only
VERCEL_ENV, since it's a platform-guaranteed variable), with a build-time assertion that fails the
build if the resolved siteUrl isn't in an explicit allowlist.
How to verify: curl -s https://mcc-cal.com/about | grep -E 'canonical|og:url' after redeploying;
should show mcc-cal.com, not dev.mcc-cal.com.
Estimated effort: XS (config/env fix) to S (if a code guard is also added).
Regression risk: Low — this only touches build-time metadata generation, not app runtime.
```

```
ID: F-02
Title: /roadmap (linked from the site footer) returns a bare Vercel 404 on direct load
Category: Functional / SEO / Deployment
Severity: High
Confidence: Confirmed
Status: Open
Affected files or routes: https://mcc-cal.com/roadmap; linked from
sites/mcc-cal-vite/src/config/site-navigation.ts:31 (PROJECT_NAV_ITEMS, Footer "Projects" section).
Evidence:
  curl -s -i https://mcc-cal.com/roadmap
  → HTTP/2 404, x-vercel-error: NOT_FOUND, body "The page could not be found / NOT_FOUND / ..."
  This is Vercel's own platform 404 (x-vercel-error header), not the app's React NotFound component —
  meaning the SPA-fallback rewrite (`{ "source": "/:path*", "destination": "/index.html" }`, present
  in both vercel.json files) is not catching this path in production. By contrast, a real prerendered
  blog post (e.g. /blog/boyd-station-community-feature, which IS in the sitemap) returns a correct 200 —
  confirming the failure is specific to routes with no static prerendered file, not a site-wide SPA
  fallback failure. `/roadmap` is not in STATIC_PAGE_ROUTES (src/config/public-routes.js), so no static
  file was generated for it at build time.
User impact: Any direct link, bookmark, browser refresh, or search-engine crawl of /roadmap fails
outright. Clicking the footer's "Roadmap" link while already browsing the site client-side likely
still works (React Router handles it without a server round-trip), but that's the only way in.
Recommended fix: Either add '/roadmap' to STATIC_PAGE_ROUTES so it gets a prerendered file like every
other page, or determine why the generic SPA rewrite isn't functioning as a safety net in production
and fix that (the rewrite pattern itself looks correct in both vercel.json files, so this may require
checking the Vercel project's dashboard-level routing/root-directory settings).
How to verify: curl -s -o /dev/null -w "%{http_code}" https://mcc-cal.com/roadmap should return 200.
Estimated effort: XS (add to STATIC_PAGE_ROUTES and redeploy) if that's sufficient.
Regression risk: Low.
```

```
ID: F-03
Title: Root `npm run lint` currently fails (exit code 1) on a parser/syntax mismatch
Category: Maintainability / CI risk
Severity: High
Confidence: Confirmed
Status: Open
Affected files: eslint.config.mjs:41 (ecmaVersion: 2022);
sites/mcc-cal-vite/scripts/generate-sitemap.js:5
Evidence:
  $ npm run lint  →  exit code 1
  sites/mcc-cal-vite/scripts/generate-sitemap.js
    5:59  error  Parsing error: Unexpected token with
  Line 5: `import pageSeoData from '../src/content/pageSeoData.json' with { type: 'json' };`
  This is the modern "import attributes" syntax, which requires a newer parser ecmaVersion than the
  2022 configured at eslint.config.mjs:41. (Note: piping this command through `| tail` masks the
  nonzero exit code in a shell pipeline — confirmed the true exit code separately without a pipe.)
User impact: Whatever CI job runs `npm run lint` (likely .github/workflows/lint-scripts.yml) is either
currently failing/blocking PRs, or is silently not gating on this — either way it's not doing its job.
Recommended fix: Bump ecmaVersion to 'latest' (or 2025+) in eslint.config.mjs for the JS/MJS/CJS block.
How to verify: npm run lint exits 0 after the fix.
Estimated effort: XS.
Regression risk: Very low — parser version bump only, no rule changes.
```

```
ID: F-04
Title: vercel-config.test.ts is failing — root and app-level vercel.json have drifted
Category: Security / Maintainability
Severity: Medium
Confidence: Confirmed
Status: Open
Affected files: vercel.json (root) vs sites/mcc-cal-vite/vercel.json;
sites/mcc-cal-vite/src/vercel-config.test.ts
Evidence: Test "Vercel config parity > keeps deployment behavior aligned across root and app configs"
fails: root vercel.json's CSP img-src and images.remotePatterns are missing `images.mcc-cal.com`
(the live R2 image CDN domain), which the app-level vercel.json has. Live production response headers
(confirmed via curl) currently match the APP-level config (img-src includes images.mcc-cal.com), so
there is no live outage today — but this is a real, currently-failing CI test and two out-of-sync
sources of truth for a security-relevant header.
User impact: None today (production is unaffected), but this is a live risk if the "wrong" config
is ever picked up (e.g. a root-directory setting change), which would silently break CSP for the
site's actual image host.
Recommended fix: Make one vercel.json the single source of truth (likely delete the app-level one if
the root one is what Vercel actually deploys from, or vice versa — confirm via the Vercel dashboard's
"Root Directory" setting first), then fix the failing test.
How to verify: npm run test:coverage → vercel-config.test.ts passes.
Estimated effort: S.
Regression risk: Medium if the wrong file is deleted — verify against the Vercel dashboard first.
```

```
ID: F-05
Title: Two API integration tests time out (5000ms)
Category: Maintainability / Test reliability
Severity: Medium
Confidence: Confirmed
Status: Open
Affected files: sites/mcc-cal-vite/src/api.integration.test.ts (describe block "api/schedule/book")
Evidence:
  FAIL src/api.integration.test.ts > api/schedule/book > handles allowed CORS preflight
  FAIL src/api.integration.test.ts > api/schedule/book > returns dev mock booking for valid request payload
  Both: "Error: Test timed out in 5000ms."
User impact: These are real, reproducible failures (not flaky-once) in the local run; if CI enforces
this test file, the schedule/book endpoint's test coverage is currently broken, masking any real
regressions in that handler.
Recommended fix: Investigate whether api/schedule/book.js itself hangs under test (e.g. an
unresolved promise, a real network call not properly mocked) or the test's mock setup is incomplete.
How to verify: npm run test:coverage shows these two tests passing.
Estimated effort: S–M depending on root cause.
Regression risk: Low (test-only fix).
```

```
ID: F-06
Title: 8 moderate npm audit vulnerabilities in sites/mcc-cal-vite production dependencies
Category: Security
Severity: Medium
Confidence: Confirmed
Status: Open
Affected files: sites/mcc-cal-vite/package-lock.json
Evidence (npm audit --omit=dev):
- react-router / react-router-dom 6.7.0–6.30.3: "same-origin redirect with path starting // causes
  open redirect via protocol-relative URL reinterpretation" (GHSA-2j2x-hqr9-3h42). Directly relevant —
  this app uses react-router-dom 6.28 for all client routing.
- @opentelemetry/core <2.8.0 (via @sentry/node → @opentelemetry/instrumentation-http): unbounded
  memory allocation in W3C Baggage propagation.
- tar <=7.5.15: PAX header size-override file-smuggling issue (transitive build-tool dependency,
  lower real-world exposure since it's not in the request path).
Root-level npm audit: 0 vulnerabilities.
User impact: The react-router open-redirect issue is the one with real exposure — a crafted `//evil.com`
style path could redirect a user off-site if the app ever redirects based on unsanitized path input.
Recommended fix: `npm audit fix` in sites/mcc-cal-vite (a fix is available for all three); re-test
after upgrading since react-router major/minor bumps can affect routing behavior.
How to verify: npm audit --omit=dev reports 0 vulnerabilities.
Estimated effort: S (bump + retest all routes).
Regression risk: Medium — react-router version bumps can subtly change route matching; run the
Playwright smoke suite after upgrading.
```

```
ID: F-07
Title: Several actively-queried Supabase tables have no tracked migration
Category: Security / Maintainability
Severity: Medium
Confidence: Confirmed
Status: Open (WIP-branch scope)
Affected files: supabase/migrations/ (only contains 20260625000000_portfolio_images.sql);
sites/mcc-cal-vite/src/components/HeroCarousel.lazy.tsx (queries `hero_slides` via raw REST fetch);
sites/mcc-cal-vite/api/contact.js (queries `contact_submissions` via supabase-js);
sites/mcc-cal-vite/src/hooks/useGoogleReviews.ts:74 (queries `testimonials`)
Evidence: grep across src/ and api/ for Supabase table access finds 4 distinct tables in use, but
only portfolio_images has a corresponding migration file with reviewable RLS policies (which are
correctly scoped: public SELECT, service_role-only writes — a strength, not a finding, for that
one table). The other three tables' schemas and RLS posture cannot be verified from the repository
at all.
User impact: Unclear/unverifiable security posture for contact form submissions and testimonials data;
schema is not reproducible from version control (disaster-recovery and onboarding risk).
Recommended fix: Add migration files for hero_slides (+ any variant table), contact_submissions, and
testimonials, generated from the current live schema (`supabase db diff` or manual authoring), and
verify each has appropriate RLS (contact_submissions in particular should almost certainly NOT allow
public SELECT, since it contains personal contact details).
How to verify: `ls supabase/migrations/` shows one file per table in active use.
Estimated effort: S per table.
Regression risk: Low if migrations are additive (just capturing existing state).
```

```
ID: A-01
Title: No skip-to-content link anywhere on the site
Category: Accessibility
WCAG criterion: 2.4.1 Bypass Blocks (Level A)
Severity: High
Confidence: Confirmed
Affected file(s): sites/mcc-cal-vite/src/components/Layout/Layout.tsx (entire file, 24 lines)
Evidence: Layout.tsx renders <Nav /> then <main className="site-main"> with no skip link before Nav,
and <main> itself has no id attribute (so there's no valid target even if a skip link were added
elsewhere).
User impact: Keyboard and screen-reader users must tab through the full primary nav (including two
submenus) on every single page load before reaching page content.
Recommended fix: Add a visually-hidden-until-focused "Skip to main content" link as the first focusable
element in Layout.tsx, targeting a new id="main-content" on the <main> element.
How to verify: Tab from a fresh page load — first focus stop should be the skip link.
Estimated effort: XS.
Regression risk: None.
```

```
ID: A-02
Title: Incorrect ARIA — role="menu"/role="menuitem" used without the required keyboard interaction model
Category: Accessibility
WCAG criterion: 4.1.2 Name, Role, Value (Level A)
Severity: Medium
Confidence: Confirmed
Affected file(s): sites/mcc-cal-vite/src/components/Layout/Nav.tsx:180,190,240,250
Evidence: The Work/Projects submenus use role="menu" and role="menuitem" (ARIA application-menu
pattern), but the only keyboard handling implemented is a document-level Escape listener and
default Tab order — no ArrowDown/ArrowUp/Home/End handling, which the ARIA Authoring Practices
require for the menu/menuitem role. Screen readers will announce these as an application menu widget
that then doesn't behave like one, which is more confusing than using no role at all.
User impact: Screen reader users get an incorrect behavioral expectation set for this widget.
Recommended fix: Remove role="menu"/role="menuitem" and let these render as plain nav lists of links
(the existing aria-expanded/aria-controls disclosure pattern on the toggle buttons is correct and
sufficient on its own), or fully implement the ARIA menu keyboard pattern if the menu semantics are
intentional.
How to verify: Screen-reader spot check (VoiceOver/NVDA) no longer announces "menu"/"menu item" for
what is functionally a nav dropdown.
Estimated effort: XS.
Regression risk: None (removing an incorrect role only).
```

```
ID: A-03 / UX-01
Title: On mobile, tapping "Work" or "Projects" in the nav never navigates to their own landing pages
Category: Accessibility + UX (objective usability problem)
Severity: Medium
Confidence: Confirmed
Affected file(s): sites/mcc-cal-vite/src/components/Layout/Nav.tsx:146-151, 206-211
Evidence: onClick handlers for the "Work" and "Projects" top-level links call
`e.preventDefault()` and only toggle the submenu when `isMobile` is true — there is no separate
affordance to actually navigate to /featured-work or /projects on a phone-width viewport.
User impact: Mobile visitors (a large share of traffic for a photography site with an audience
often browsing on-the-go) cannot reach the "Featured Work" or "Projects" overview pages from the
primary nav at all — only the sub-items underneath them.
Recommended fix: Add a distinct "View all" link inside the opened submenu, or make a second tap
on an already-open toggle navigate through.
How to verify: On a 375px viewport, tap "Work" — confirm there is a way to land on /featured-work.
Estimated effort: XS–S.
Regression risk: Low.
```

```
ID: STRENGTH-A11Y-01
Title: PortfolioLightbox is a correct, well-built modal implementation
Category: Accessibility (strength — no action needed)
Confidence: Confirmed
Affected file(s): sites/mcc-cal-vite/src/components/portfolio/PortfolioLightbox.tsx;
sites/mcc-cal-vite/src/components/portfolio/PortfolioGrid.tsx:53
Evidence: role="dialog", aria-modal="true" (lines 202-203); full Tab-wraparound focus trap
(lines 99-120); Escape-to-close, Arrow/PageUp/PageDown/Home/End navigation, +/-/0 zoom controls,
all with event.preventDefault(); focus moves into the dialog on open (line 55); and — checked
specifically because it's often missed — focus correctly returns to the triggering thumbnail on
close via `openerRef.current?.focus()` in the parent PortfolioGrid.tsx:53. This meets WCAG 2.4.3
(Focus Order) and 2.1.2 (No Keyboard Trap) as implemented. No fix needed; noted so it isn't
inadvertently "fixed" or regressed later.
```

```
ID: M-01
Title: HeroCarousel maintains two independent, silently-diverging sources of truth for hero content
Category: Maintainability
Severity: Medium
Confidence: High confidence (subagent-verified, spot-checked)
Affected files: sites/mcc-cal-vite/src/components/HeroCarousel.lazy.tsx:14-16,126-133,155-172;
sites/mcc-cal-vite/src/components/heroSlides.ts (entire file)
Evidence: The component always renders the hardcoded FAVORITE_HERO_SLIDES array on first paint,
then only replaces it with Supabase data if a fetch succeeds within 5s — this is closer to "two
content sources, one wins a race" than a true error-only fallback. Homepage OG/SEO image metadata
(HOMEPAGE_HERO_IMAGE_SEO_ENTRIES in heroSlides.ts) is derived only from the hardcoded array and will
never reflect Supabase-managed content changes at all.
Recommended fix: Either codegen heroSlides.ts from the Supabase table at build time, or explicitly
document/monitor it as a stale offline seed rather than a live fallback.
Estimated effort: S.
Regression risk: Low.
```

```
ID: M-02
Title: Dead code — OptimizedPortfolioLightbox.tsx has no real importers
Category: Maintainability
Severity: Low
Confidence: Confirmed (subagent-verified)
Affected files: sites/mcc-cal-vite/src/components/portfolio/OptimizedPortfolioLightbox.tsx (156 lines)
Evidence: PortfolioLightbox.tsx (the live one) is imported by FeaturedPortfolio.tsx, PortfolioGrid.tsx,
and portfolio/index.ts. OptimizedPortfolioLightbox.tsx has no importers anywhere except a mention in
components/portfolio/README-Optimization.md — an orphaned, ~70%-overlapping duplicate.
Recommended fix: Confirm it's unused, then delete it and update the README.
Estimated effort: XS.
Regression risk: None if confirmed unused.
```

```
ID: M-03
Title: accessibility.tsx and policies-legal.tsx duplicate ~150-200 lines of an interactive "legal doc shell"
Category: Maintainability
Severity: Medium
Confidence: Confirmed (subagent-verified)
Affected files: sites/mcc-cal-vite/src/pages/accessibility.tsx;
sites/mcc-cal-vite/src/pages/policies-legal.tsx
Evidence: Both pages independently implement byte-for-byte identical helpers (prefersReducedMotion),
identical state shape, an identical reading-time calculation, an identical scroll-progress effect,
and an identical IntersectionObserver scroll-spy (same rootMargin string). The actual legal/accessibility
prose content in both files is simple, appropriately long, static JSX — not the source of complexity.
Recommended fix: Extract a shared <LegalDocLayout> component or useLegalDocShell() hook owning the
duplicated state/effects; both pages become nav config + content passed as children.
Estimated effort: M.
Regression risk: Low if extracted carefully with existing tests as a guardrail.
```

```
ID: C-01
Title: QuoteRequestForm step-section numbering ("01"-"05") doesn't match its own "Step X of 3" indicator
Category: Content / UX
Severity: Low
Confidence: Confirmed (subagent-verified)
Affected files: sites/mcc-cal-vite/src/components/forms/QuoteRequestForm.tsx
(totalSteps=99, step headings at lines 316,390,535,568,624)
Evidence: The progress indicator says "Step 2 of 3," but the section header inside that same step
jumps from "02 Project details" to "03 Deliverables" — reads like leftover numbering from an earlier
draft with more steps than the current 3-step flow.
Recommended fix: Renumber section headers to match the actual 3-step structure, or drop the numeric
prefixes entirely.
Estimated effort: XS.
```

```
ID: C-02
Title: Generic "Required" validation message breaks the field-specific pattern used elsewhere in the same form
Category: Content
Severity: Low
Confidence: Confirmed (subagent-verified)
Affected files: sites/mcc-cal-vite/src/components/forms/QuoteRequestForm.tsx (lines ~148-151)
Evidence: intended_use/duration/geographic/budget fields all show "Required" while every other field
in the same form shows a specific message (e.g. "Date is required").
Recommended fix: Give these four fields field-specific messages matching the rest of the form.
Estimated effort: XS.
```

```
ID: C-03
Title: Minor text mismatch between error copy and actual link text
Category: Content
Severity: Low
Confidence: Confirmed (subagent-verified)
Affected files: sites/mcc-cal-vite/src/components/forms/ContactForm.tsx (line 34 vs line 217)
Evidence: Consent error says "accept the privacy policy," but the actual link is labeled
"policies & legal information."
Recommended fix: Align the two phrasings.
Estimated effort: XS.
```

```
ID: D-01
Title: (Disclosure, not a defect) Environment-specific tooling failures in this audit session
Category: Environment
Severity: N/A
Confidence: Confirmed
Evidence: (1) node_modules/lighthouse's locale files were incomplete (missing hr.json) — almost
certainly Google Drive sync dropping files, consistent with the prior audit's H2 finding about this
checkout living on Drive; resolved locally by force-reinstalling the package for this session, but
will likely recur. (2) No headless Chrome binary exists in this sandbox, so real Lighthouse/Core Web
Vitals scores could not be captured — not attempted to fix by installing a browser, which was judged
out of scope for a read-only audit. (3) A full production build took over 2 hours end-to-end in one
attempt during this session (vs. ~12 minutes on an earlier attempt the same day) — fresh, concrete
evidence for the prior audit's already-flagged Google Drive checkout risk.
```

```
ID: D-02
Title: (Disclosure, not a defect) Local production build silently drops 90 public assets in this checkout
Category: Environment
Severity: N/A
Confidence: Confirmed (local) / Not applicable to production (confirmed separately via live curl)
Evidence: The completed local build (exit code 0) logged 90 "Skipped public asset that could not be
copied" lines from the repo's own `copy-public-skip-one-nation-divided` Vite plugin — including
robots.txt, every images/social/*-og.jpg file, several fonts, both resume/CV PDFs, and multiple
homepage hero images. `ls dist/robots.txt` confirms it is genuinely missing from this local build
output. This plugin exists specifically to route around Google Drive marking files as locked/dataless
placeholders mid-build (documented in the prior audit's H2 finding) — it was evidently triggered far
more broadly this run than its original single-folder purpose. Cross-checked against the live site:
`curl https://mcc-cal.com/robots.txt` and the OG image URLs all resolve correctly in production,
confirming this is specific to building on this local Drive-synced checkout and does not reflect
what Vercel's cloud build (which clones fresh from GitHub) actually ships. Flagging so nobody mistakes
a local `npm run build` "succeeding" in this environment as proof the build output is complete or
deployable from this machine.
```

---

## 5. Route-by-Route Results

All 22 static routes in `STATIC_PAGE_ROUTES` were checked for direct-load HTTP status; canonical/OG
tags were spot-checked on 8 of them directly (all affected by F-01 except `/`).

| Route | Direct-load status | Canonical/OG issue (F-01) |
|---|---|---|
| `/` | 200 | Not affected (correct, mcc-cal.com) |
| `/about` | 200 | Affected |
| `/journalism` | 200 | Affected |
| `/concerts` | 200 | Affected |
| `/contact-us` | 200 | Affected |
| `/faq` | 200 | Affected |
| `/blog` | 200 | Affected |
| `/policies-legal` | 200 | Affected |
| `/portraits` | 200 | Affected |
| `/nature`, `/events`, `/authors`, `/authors/mccal`, `/podcast`, `/book-a-podcast`, `/grab-a-coffee`, `/projects`, `/terranova`, `/accessibility`, `/featured-work`, `/letting-me-go`, `/request-a-quote` | Not individually curled this pass, but generated by the same build-time script as the routes above | Presumed affected (same root cause) — flag as "Needs verification" per-route, "Confirmed" for the pattern |
| `/blog/boyd-station-community-feature` (real post) | 200 | Not spot-checked for canonical this pass |
| `/blog/test-slug-xyz` (fake slug) | 404 (correct — post doesn't exist) | N/A |
| `/roadmap` | **404 (F-02, real bug)** | N/A |
| `/showcase`, `/api-test` | 404 (correct — intentionally dev-only, matches robots.txt disallow) | N/A |

---

## 6. Accessibility Results

**Blockers:**
- A-01: No skip-to-content link (WCAG 2.4.1, Level A).
- A-02: Incorrect `role="menu"`/`role="menuitem"` ARIA usage (WCAG 4.1.2).
- A-03: Mobile nav prevents reaching `/featured-work` and `/projects` directly (usability blocker on mobile).

**Strengths confirmed:**
- PortfolioLightbox modal: correct dialog semantics, full focus trap, and focus restoration (STRENGTH-A11Y-01).
- Nav's `aria-expanded`/`aria-controls`/`aria-current` pairing on submenu toggles is correctly implemented and references real, existing IDs.
- Decorative icons consistently marked `aria-hidden="true"` throughout Nav/Footer/Lightbox.
- Footer uses `role="contentinfo"` and `aria-labelledby` sections correctly (per earlier codebase exploration, not independently re-verified line-by-line this pass).

**Not verified this pass (flag as "Needs verification"):** color contrast values (no rendering tool available), heading hierarchy on every page, full form label/error-association walkthrough on ContactForm/QuoteRequestForm beyond the content-focused read, `prefers-reduced-motion` handling on the hero carousel, 200%-zoom behavior.

---

## 7. Performance Results

**No Lighthouse/Core Web Vitals scores could be captured** — this sandbox has no headless Chrome binary, and Lighthouse's launcher hard-fails without one. No numbers are invented here.

Based on direct code and header review instead:
- Homepage response: `content-length: 5556` bytes for the initial HTML (lightweight — this is a prerendered static shell, not a large SSR payload), `cache-control: public, max-age=0, must-revalidate` with an `etag`, served from Vercel's edge (`x-vercel-cache: HIT` observed) — good caching posture.
- Route-level code splitting via `React.lazy()` is used across all 22+ routes (confirmed in earlier codebase exploration).
- Images are served from a dedicated CDN domain (`images.mcc-cal.com`, Cloudflare R2) with a responsive-`srcset`/blur-placeholder pipeline (`OptimizedImage`, `imageOptimization.ts`) rather than shipped in the main bundle.
- **Needs verification:** whether above-the-fold hero images are marked eager/high-priority and offscreen portfolio-grid images are genuinely lazy — this requires either a rendered-page inspection (blocked, see D-01) or a closer read of `OptimizedImage`'s `loading`/`fetchpriority` attribute logic than time allowed this pass.

---

## 8. SEO and Metadata Matrix

All 22 entries in `pageSeoData.json` have a title and description within healthy length bounds (no
title over 60 characters, no description over 160 or dramatically under 70) — checked programmatically
across every entry, zero flags.

| Route | Title | Meta description | Canonical | OG | H1 | Indexability | Structured data | Issues |
|---|---|---|---|---|---|---|---|---|
| `/` | Pittsburgh Photographer \| Caleb McCartney \| McCal Media | ✓ (147 chars) | mcc-cal.com (correct) | ✓ | (not re-verified this pass) | indexable | WebSite/Person/Organization/ImageObject (jsonLd.ts) | None found |
| `/about` | About Caleb McCartney \| Pittsburgh Photographer | ✓ | **dev.mcc-cal.com (F-01)** | Same domain issue | — | indexable | — | F-01 |
| `/journalism` | Photojournalism Portfolio \| Caleb McCartney | ✓ | **dev.mcc-cal.com (F-01)** | Same domain issue | — | indexable | ImageObject entries | F-01 |
| `/concerts`, `/contact-us`, `/faq`, `/blog`, `/policies-legal`, `/portraits`, and (presumed, same mechanism) the remaining 15 static routes | (see pageSeoData.json — all well-formed) | ✓ | **dev.mcc-cal.com (F-01)** | Same domain issue | — | indexable | Present per route | F-01 |
| `/roadmap` | (roadmap.tsx exists but has **no pageSeoData.json entry and no STATIC_PAGE_ROUTES entry**) | — | N/A — page 404s (F-02) | N/A | — | **not indexable — hard 404** | None | F-02 |
| `/blog/:slug` (dynamic posts) | Per-post, prerendered individually (confirmed real posts return 200 with presumably post-specific meta — not re-verified per-post this pass) | — | Not spot-checked this pass | — | — | indexable (in sitemap, 9 posts listed) | — | Needs verification: whether per-post canonical also suffers F-01's pattern |

**robots.txt:** correctly disallows `/api/`, `/showcase`, `/api-test`, `/changelog`; allows everything
else; references the sitemap. Confirmed live and correct.

**sitemap.xml:** 31 URLs, includes `image:image` entries with title/caption for each. Does **not**
include `/roadmap` (consistent with it not being a real indexable page today).

---

## 9. Responsive and Browser Results

Not completed to the full 7-breakpoint, multi-engine standard specified in the audit brief — see
"What could not be verified" in the Executive Summary for why (environment build/tooling slowness
consumed the available time budget). Only Chromium-equivalent HTTP/DOM-level checks were performed
against production; no visual/responsive rendering was captured this pass. Recommend a follow-up pass
once off the Google Drive checkout (per the prior audit's H2) or from a different machine with a
working local Chrome install.

---

## 10. Security and Privacy Results

**Real, actionable items:**
- F-06: react-router open-redirect (moderate, has a fix available via `npm audit fix`).
- F-07: schema/RLS posture unverifiable for 3 of 4 actively-used Supabase tables, most notably
  `contact_submissions` (personal contact data) which has no migration to confirm it isn't publicly
  readable.
- F-04: CSP config drift between two vercel.json files (currently not live-exploitable, but a real
  failing test and latent risk).

**Confirmed clean / not vulnerabilities (explicitly not sensationalized):**
- No `dangerouslySetInnerHTML` anywhere in `src/` — zero XSS-via-innerHTML surface.
- `.env.local` is properly gitignored; the one tracked `.env.production` file contains only a
  non-secret build flag.
- The Supabase anon key and Sentry DSN visible in the client bundle are expected, public-by-design
  identifiers, not leaked secrets — no service-role key or other privileged credential found in
  client-shipped code.
- `portfolio_images` RLS is correctly scoped (public read, `service_role`-only writes).
- `api/contact.js` has no email-header-injection risk (uses Resend's structured `text:`/`subject:`
  fields via its SDK, not raw string concatenation into SMTP headers), has Zod validation, rate
  limiting, a honeypot, and a minimum-submit-delay timing check.
- Production security headers (CSP, HSTS, Permissions-Policy, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy) are all live and reasonably configured — matches OWASP secure-header baseline.
  `script-src 'unsafe-inline'` is present, which is a known CSP-weakening pattern common to sites
  without a nonce/hash pipeline — worth a future hardening pass but not flagged as a standalone
  finding here since it's a common, low-urgency tradeoff.

---

## 11. Maintainability Assessment

Overall: this is a clean, well-typed codebase for its size. The maintainability issues found (M-01,
M-02, M-03) are all real but modest in scope — no evidence of systemic architectural problems.
`jsonLd.ts` (536 lines) and `QuoteRequestForm.tsx` (693 lines) were specifically checked given their
size and found to be cohesive, single-purpose modules that don't need splitting. The actual
maintainability debt is concentrated in: (1) a hand-rolled "legal doc shell" duplicated across two
pages (M-03), (2) one orphaned dead-code component (M-02), and (3) a hero-content dual-source design
that will silently drift over time (M-01) — all addressable independently without a larger refactor.

---

## 12. Recommended Implementation Plan

### Immediate
- **F-01** (canonical/OG dev.mcc-cal.com bug): audit and correct the Vercel Production `VITE_SITE_URL`
  variable; add a build-time guard in `resolveSiteUrl()`. Files: `scripts/generate-route-meta.js`.
  No dependencies. Test: re-curl production after redeploy. Acceptance: every route's canonical/og:url
  shows `mcc-cal.com`. Rollback: revert the env var / code guard, redeploy previous build.
- **F-02** (`/roadmap` 404): add `/roadmap` to `STATIC_PAGE_ROUTES` (and a `pageSeoData.json` entry).
  Files: `src/config/public-routes.js`, `src/content/pageSeoData.json`. Test: curl returns 200.
  Acceptance: direct load, refresh, and share of `/roadmap` all work. Rollback: revert the route addition.
- **F-03** (broken root lint): bump `ecmaVersion` in `eslint.config.mjs`. Test: `npm run lint` exits 0.
  Rollback: revert the one-line config change.

### Next
- **F-04** (vercel.json drift): reconcile the two configs after confirming which is authoritative via
  the Vercel dashboard; fix `vercel-config.test.ts`.
- **F-05** (timing-out tests): investigate `api/schedule/book.js` test mocking.
- **F-06** (npm audit): `npm audit fix` in `sites/mcc-cal-vite`, re-run the Playwright smoke suite.
- **F-07** (missing migrations): author migration files for `hero_slides`, `contact_submissions`,
  `testimonials`, verifying RLS on each (especially `contact_submissions`).
- **A-01/A-02/A-03**: skip link, remove incorrect menu ARIA, fix mobile Work/Projects nav reachability.

### Later
- **M-01/M-02/M-03**: hero-content single-source-of-truth, delete dead lightbox component, extract
  shared legal-doc-shell component.
- **C-01/C-02/C-03**: QuoteRequestForm/ContactForm copy fixes.
- A follow-up performance pass with real Lighthouse/Core Web Vitals once run from an environment with
  a working Chrome install, and a full 7-breakpoint responsive/cross-browser pass off the Google Drive
  checkout.

---

## 13. Small High-Value Improvements

1. Fix F-01 (canonical/OG domain) — highest ratio of impact to effort in this entire audit.
2. Fix F-02 (`/roadmap` 404) — a real, linked page currently unreachable by direct URL.
3. Fix F-03 (broken lint) — restores a CI safety net that's currently not working.
4. Add a skip-to-content link (A-01) — small, visible, measurable a11y win.
5. Remove incorrect `role="menu"`/`role="menuitem"` from Nav.tsx (A-02) — one-line-per-occurrence fix.
6. Fix mobile Work/Projects nav reachability (A-03) — directly affects the primary-audience mobile
   experience.
7. `npm audit fix` for the react-router open-redirect (F-06).
8. Align ContactForm's error text with its actual link text (C-03) — trivial, improves clarity.
9. Fix QuoteRequestForm's step numbering (C-01) — small copy fix, removes a confusing inconsistency.
10. Delete the orphaned `OptimizedPortfolioLightbox.tsx` (M-02) — pure cleanup, zero risk.

---

## 14. Deferred or Rejected Changes

- **Full repo/tooling-health re-audit** (git history size, Google Drive checkout migration, workflow
  sprawl): explicitly out of scope per the site owner's direction — already covered by
  `docs/AUDIT-REPORT-2026-06-14.md`; this pass only re-confirms the Drive-checkout slowness is still
  present and worse than previously measured (D-01), it does not re-derive the rest of that report.
- **Installing a headless Chrome browser in this sandbox to get real Lighthouse scores**: considered
  and rejected as out of scope for a read-only audit engagement; recommend running Lighthouse from a
  normal developer machine instead.
- **Hardening `script-src 'unsafe-inline'` in the CSP with a nonce/hash pipeline**: noted as a real
  but low-urgency hardening opportunity, not written up as a standalone numbered finding since it's a
  common, deliberate tradeoff many sites make and reversing it is a non-trivial build-pipeline change.
- **CMS or content-architecture migration**: not evaluated — no evidence in this pass that non-technical
  editing frequency or collaboration needs justify one; the existing typed data-file approach
  (`pageSeoData.json`, `site-navigation.ts`, manifests) is proportionate to the site's needs.
