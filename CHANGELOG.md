# Changelog

## 2026-08-27

### Blog/Portfolio Cross-Linking and a Photojournalism Excerpt Rewrite

- Field Notes and the portfolio pages (Portraits/Events/Concerts/Journalism) had zero links between them in either direction - confirmed by grepping both for cross-references. Most Field Notes posts are personal/thesis essays with no real tie to the photography services, so rather than a generic "related posts" rule, added an explicit lookup (`RELATED_PORTFOLIO_LINKS` in `blog.tsx`) linking the two posts that are actually photojournalism-relevant ("Three Days With Boyd's Station", "The Capitalist Contradiction") to `/journalism`, rendered as a small "More From the Field" block. Added the reciprocal link from the Journalism portfolio page's intro copy back to `/blog`.
- Rewrote the excerpt on "Three Days With Boyd's Station" (the one post that's a genuine documentary-photography piece) to open with "documentary photography and photojournalism" instead of just "photo essay" - this excerpt is what drives the post's meta description. Left the personal/thesis posts' copy untouched; forcing photography keywords into essays about grief, dreams, or trauma would misrepresent the content.
- Adding a `Link` to `JournalismPortfolio.tsx` surfaced a pre-existing gap in its test: the component had never needed react-router context before, so `JournalismPortfolio.test.tsx` wasn't wrapped in a `MemoryRouter`. Fixed by wrapping both test renders, matching the pattern already used in `HeroCarousel.test.tsx`.

### Dead Redirects and www/apex Duplicate Indexing

- A fresh Search Console export showed `/terranova` and `/roadmap` both indexed and both 308-redirecting to `https://dev.mcc-cal.com/...`, a host that no longer resolves at all - anyone (including Googlebot) following either link hit a dead connection. Neither path has any matching content anywhere in the current codebase, so both redirect rules were removed outright rather than pointed somewhere new.
- The same export showed `www.mcc-cal.com` and `mcc-cal.com` both serving identical 200 responses with no redirect between them - confirmed via `curl`, same etag/last-modified on both. Google had indexed several pages (`/projects`, `/request-a-quote`, `/letting-me-go`) under the `www.` variant specifically, splitting ranking signal for the same content across two URLs. Added a host-matched redirect (`www.mcc-cal.com/*` -> `mcc-cal.com/*`, 308) in both `vercel.json` files, consolidating to the bare domain since that's what `VITE_SITE_URL`, canonical tags, and every JSON-LD `@id`/`url` already assume.

### SEO Keywording and On-Page Copy

- The `keywords` arrays in `pageSeoData.json` only ever fed the `ImageObject` JSON-LD, never a `<meta name="keywords">` tag (Google ignores that tag anyway, and `usePageMeta.ts` never set one). Meanwhile the actual rendered copy on Portraits, Events, Concerts, and Journalism was 20-45 words per page - an H1 and one intro sentence before the portfolio grid - so several already-declared target terms (corporate headshots, LinkedIn headshots, conference photographer, documentary photographer, live music photographer, etc.) existed only in meta/structured data, not in anything a visitor or crawler actually reads.
- Added the missing competitor-validated long-tail terms to `pageSeoData.json` (title/description/OG copy tweaked on Portraits and Events to work one in directly) and wove the same phrases into the real intro paragraphs on all four thin portfolio pages, plus the matching JSON-LD service `keywords` arrays.
- Added 3 service-discovery and pricing-intent FAQ entries (corporate/LinkedIn headshots, event/conference pricing, travel) to `faq.tsx`, which automatically feed the existing `FAQPage` schema - the prior 7 questions were all logistics (turnaround, backups, releases), the exact gap AI Overview/AEO citations tend to reward.
- Flagged `docs/standards/seo-starter-guide.md` as outdated: it was written for the retired Squarespace site (Squarespace admin UI, its auto-sitemap) and no longer describes how SEO works in the current Vite/React implementation.

### GA4 Alongside Vercel Analytics

- Added `src/utils/ga4.ts`: a lazy `gtag.js` loader gated behind `VITE_ENABLE_GA` + `VITE_GA_MEASUREMENT_ID`, with `send_page_view: false` since `RouteAnalytics` already fires a `page_view` event on every SPA navigation - letting gtag's own automatic pageview through too would have double-counted the first page.
- `trackWebsiteEvent` now forwards every event to both Vercel Analytics and GA4 from the one existing call site, rather than wiring GA4 as a separate parallel tracker.
- CSP updated in both `vercel.json` files (root and site - a test enforces they stay identical) to allow `googletagmanager.com`, `google-analytics.com`, and `analytics.google.com`.

## 2026-08-24

### Work Phone Number on the Contact Card

- Added a `TEL;TYPE=WORK,VOICE` field to `caleb-mccartney.vcf`, the vCard downloaded from the "Save My Contact" button on `/links`.

### /links Was 404ing in Production

- Every route on this site is served as its own pre-rendered static HTML file (found via Vercel's cleanUrls filesystem matching); the `/:path*` -> `/index.html` SPA catch-all rewrite is never actually reached for a real request, confirmed by testing a nonexistent path and a nonexistent author slug - both 404 the same way `/links` did. `/links` was the first route ever deliberately left out of static pre-rendering (to keep it off the sitemap), so it was the first to hit this.
- `scripts/generate-route-meta.js` now also pre-renders a small `HIDDEN_ROUTES` list (currently just `/links`) with the same mechanism as every other page, still entirely separate from `STATIC_PAGE_ROUTES`/the sitemap. `applyRouteMeta` gained an optional `robots` field to bake `noindex, nofollow` into the static file itself, on top of the existing `X-Robots-Tag` header.

### A TestFlight Link on the Tap Card

- Added "Join the News App Beta" to `/links`, pointing at the TestFlight enrollment link. It's an external destination, so it opens in a new tab like the social icons already do, unlike the existing internal links (`Grab a Coffee`, `Book a Podcast`) which stay in-app.

### A Hidden Tap-Card Page for the Physical NFC Card

- Added `/links`: a standalone, Linktree-style page reachable only by direct URL, built for a physical NFC business card. Not in nav, footer, or the sitemap, and disallowed in `robots.txt`.
- Registered unconditionally in the router rather than behind the existing DEV-only pattern used by `/showcase`, `/api-test`, and `/changelog`, since this page has to work in production for the physical tag to work.
- Includes a "Save My Contact" vCard download (a static `.vcf` file rather than a JS-generated blob, more reliable across iOS/Android "save contact" flows) and a `links_page_view` analytics event keyed off `?src=` on the URL, so taps from the physical card are distinguishable from any other way someone reaches the link.
- Layout is entirely built off the site's existing `--mcc-*` CSS custom properties, so dark/light mode work without extra code, and sizing uses `clamp()` tied to viewport height so the card fits common phone screens without scrolling.

### React Router and shell-quote Security Patches

- Bumped `react-router-dom` to 6.30.6 to close GHSA-jjmj-jmhj-qwj2, an open redirect that could be turned into XSS, present in 6.30.2 through 6.30.4.
- Pinned `shell-quote` to 1.9.0+ in this site's own lockfile (already fixed at the repo root by an earlier Dependabot PR), closing a quadratic-complexity denial of service pulled in transitively through `concurrently`.
- Two other open `react-router` advisories only have a fix in v7, a major version bump touching every file that imports `react-router-dom`. Reviewed both: one only affects apps doing manual SSR hydration, which this is not; the other requires attacker-controlled input reaching a navigation target, and nothing in this codebase builds a `Link`/`navigate` target from user input. Dismissed on GitHub with recorded reasoning rather than forcing an unrelated major upgrade.

## 2026-08-12

### One Legal Page Became Three

- `policies-legal.tsx` was 1,075 lines holding 30 sections, and its own navigation already admitted what it was: License, Privacy Policy, Cookie Policy, Terms & Conditions. Four documents sharing one URL. A client could not be sent the terms without being sent everything, and none of the documents could be found on its own.
- Split into `/licensing`, `/privacy` (privacy and cookies together) and `/terms` (the 24-subsection client agreement). `/policies-legal` stays as an index — it is linked from the footer, FAQ, podcast page and contact form, and it keeps the old `#license`, `#privacy` and `#terms` anchors so external fragment links still land somewhere useful. Fragments never reach the server, so they cannot be redirected.
- Extracted `components/legal/LegalDocument.tsx`: table of contents with scrollspy and search, reading time, reading-progress bar, and the mobile drawer. All three documents share it, and it builds as its own chunk rather than being duplicated three times.
- Wrote the licensing page properly rather than moving it. The old License section was a single paragraph; the new page covers what a licence grants, the four dimensions that scope one, editorial versus commercial use, releases, credit requirements, what is not permitted, and what to do about an image already published without a licence.
- Added the `license` property to `generateImageObjectSchema`, alongside `acquireLicensePage`, `creditText`, `copyrightNotice` and `creator`. Google requires `license` for the Licensable badge and its absence fails silently — attribution still renders, the badge simply never appears.

### Fixes Found While Splitting

- The effective date was rendered from `new Date()`, so every legal document told every reader its terms had changed today. `LegalDocument` now requires the date as a prop, because it is a factual claim about a document rather than something to compute.
- The terms page had an `h2` reading "Terms & Conditions" directly under an `h1` reading "Terms & Conditions". Correct when it was one document among four; redundant now. It reads "Overview", which is what the table of contents has always called it.
- The prerendered title said "Policies and Legal" while the page set "Policies & Legal" at runtime. Crawlers see the prerendered one; they now agree.
- The contact form's consent checkbox linked to the combined page for what is a privacy and terms agreement. It now names and links both.
- The footer listed a single "Policies & Legal" entry; it lists Licensing, Privacy and Terms, which is what people look for.

### Three Published Assignments Now Carry Their Credit

- `Trump Returns Butler`, `Kamala Speaks Erie` and `Tim Walz Erie` were all marked `published: false` with no outlet, so they were absent from the "Recent published work" strip and carried no publication credit anywhere. All three ran in The Globe, Point Park University's student-run paper. Credited in each event's `tags.json`, which is where event metadata lives, following the worked example in `Fern Hollow Nature Center Groundbreaking`.
- Published events go from 4 to 7 of 17. Once these images are re-stamped, `IPTC:Source` will carry the outlet the way the Fern Hollow frames already do.
- `articleUrl` is left empty on all three: the direct links are not something that can be derived, and a wrong URL in structured data is worse than an absent one.

### Two Files Were Lying About Their Format

- `050924_Tim_Walz_Erie_PA.png` and `051024_Trump_Rally_Attendee_Butler_PA.png` were JPEGs with a `.png` extension. Browsers sniff content so they displayed correctly, which is why this went unnoticed — but they were served with the wrong Content-Type, and `exiftool` cannot write rights metadata to a file whose extension contradicts its contents.
- Renamed to `.jpg` with `git mv`, caption keys updated, and every manifest that referenced them regenerated. This mattered more than it looked: the Tim Walz event has exactly one image, and that file was it.


## 2026-08-11

### Photographs Now Carry Their Own Rights and Captions

- The published photographs carried no copyright, creator, credit or rights statement at all, and `scripts/optimize-images.js` was stripping whatever the originals had — sharp discards metadata unless told otherwise. Embedded metadata is the only attribution that survives an image being copied off the site.
- `scripts/optimize-images.js` now calls `withMetadata()`. Verified by running a control image with full licensing tags through the exact pipeline settings: all fields were destroyed before, all survive now.
- Added `scripts/metadata/embed-image-rights.js`, which writes IPTC/XMP rights fields via exiftool. sharp cannot do this — it exposes IPTC blocks as opaque buffers.
- Fields follow the IPTC Photo Metadata Standard and the five Google reads for Google Images: Creator, Credit Line and Copyright Notice for attribution, plus Web Statement of Rights and Licensor URL to enable the Licensable badge. Written to XMP, IIM and EXIF so tools that read only one still find them.
- Credit uses the AP form `Caleb McCartney/McCal Media`. The parenthetical `(Photo by …)` stays in caption text, where AP puts it.
- Images are declared `digitalCapture` under the IPTC DigitalSourceType vocabulary — an explicit assertion of original photography rather than generated imagery. Applied only to real photographs.
- Journalism images additionally receive their AP-style caption, headline, capture date, publishing outlet and keywords from the journalism manifest. Other portfolios get rights fields only; they have no caption data, and inventing captions would put false statements in the files.
- Applied to the 531 journalism images (529 written). Scoped deliberately: these images are committed without Git LFS, so stamping rewrites every blob permanently — roughly 1.1 GB for all five portfolios against a 2.4 GB `.git`. The remaining portfolios are a separate decision.
- The script is idempotent, skipping files that already carry the current Web Statement, so it can run on a schedule without rewriting thousands of binaries each pass.

### Structured Data Can Finally Earn the Licensable Badge

- `generateImageObjectSchema` emitted `contentUrl` and `author` but not `license`, which Google explicitly requires for badge eligibility. It now emits `license`, `acquireLicensePage`, `creditText`, `copyrightNotice` and `creator`, pointing at the existing `/policies-legal#license` and `/request-a-quote` pages.
- Added `image-rights-parity.test.ts`, asserting the page's JSON-LD and the metadata embedded in the files claim the same creator, credit, copyright and licensing URLs. Two sources of rights data that disagree would be worse than one.
- The missing-`license` failure is silent — attribution still renders, the badge simply never appears — so it is now covered by a test rather than left to be noticed.

### Two Mislabelled Image Files

- `050924_Tim_Walz_Erie_PA.png` and `051024_Trump_Rally_Attendee_Butler_PA.png` are JPEGs with a `.png` extension. Browsers sniff content so they display correctly, but they are served with the wrong Content-Type and exiftool cannot write metadata to them. Reported by name rather than silently skipped; fixing them means renaming and regenerating the manifests that reference them.

### Every Page Can Now Render Without a Browser

- `Nav` read `window.innerWidth` inside a `useState` initializer, which runs during render. Because `Nav` is on every page, that single line made the entire app impossible to render outside a browser — the blocker for prerendering, which is the change that would lift both LCP and the site's structured-data coverage.
- Fixed with a guarded lazy initializer. The resize effect now also runs on mount, so the desktop default is corrected immediately rather than only when the viewport happens to change — previously nothing re-evaluated it after the initial render.
- Added `ssr-safety.test.tsx`, which renders nine pages with no DOM present and asserts each produces real markup rather than an empty shell. It runs in the node environment on purpose: under the project's jsdom default, `window` exists and the suite would pass without testing anything.
- Guarded the `matchMedia` mock in the shared test setup so suites can opt into the node environment without the setup file failing before any test runs.
- Verified by reintroducing the original line and confirming the suite fails.

### Dynamic OG Images: Investigated and Dropped

- The roadmap proposed generating per-page Open Graph images, on the premise that every blog post shared one image. That premise was wrong. `generate-route-meta.js` already gives each post its own lead photograph — 10 distinct images across the posts — and each portfolio has a purpose-made social card.
- For a photography site the real photograph is a better share image than a generated text card, so building this would have been a downgrade. Recorded here so the idea is not revisited from the same false premise.

## 2026-08-10

### Sitemap Dates Crawlers Can Trust

- 21 of 30 sitemap URLs carried no `lastmod`. That is the one sitemap signal Google still acts on — it schedules recrawls from it — and Google drops the signal entirely for sites that report it inaccurately.
- Portfolio routes now take their `lastmod` from the `generated` stamp inside the manifest that renders them. That is the truthful answer for pages whose content changes when photos are added, and far better than the page component, which barely ever changes.
- Removed `changefreq` and `priority` from every entry. Google has said for years that it ignores both.
- Deriving dates from git turned out to be a trap: the repository is a shallow clone, so `git log` reports the boundary commit for every older file and would have dated roughly 20 pages identically. The generator now detects a shallow clone and omits the date rather than emitting a same-date-for-everything lie.
- Dates already published in the committed sitemap are carried forward when they cannot be recomputed. The SEO Auto Update workflow checks out full history and can date the static content pages; without carry-forward, Vercel's shallow build would drop that work on every deploy.
- Added `sitemap.static.test.ts`: every public route is listed, no `changefreq`/`priority`, all dates ISO-formatted, none in the future, portfolio routes always dated, and a guard against every entry sharing one date — the exact symptom of a bad date source.

### Read-Only API Routes Cached at the Edge

- `google-reviews` sent `no-store` on every response, so each request was a billed Google Places API call. Successful responses are now cached at the edge for an hour with a day of `stale-while-revalidate`.
- `testimonials` sent `public, max-age=300`, which pins a copy in each visitor's browser where no deploy can clear it. Now `max-age=0` with `s-maxage=3600`, so browsers revalidate and the CDN does the serving.
- Errors, rate-limit rejections, and the empty-array fallbacks are deliberately not given the success TTL. Caching "reviews unavailable" for an hour would outlast the blip that caused it. The degraded testimonials response gets 60 seconds instead.
- `podcast-feed` and `manifests/[type]` were already correctly cached and are unchanged.
- Added `api-cache-headers.test.ts`, which asserts the read-only routes set an edge TTL, that no route pins a long browser `max-age`, that degraded responses are cached far more briefly than real data, and that `contact` and `quote` are never edge-cached.

## 2026-08-09

### CSP Blocked Every Client-Side Supabase Call

- `connect-src` never listed the Supabase origin, so every browser-side Supabase request was refused by CSP in production. Two features were affected and both fail silently to a fallback, which is why nothing looked broken: hero slides in `HeroCarousel`, and Google reviews in `TestimonialsSection` on `/about`. Added `https://*.supabase.co` to both `vercel.json` files.
- Added `csp-connect-src.test.ts`, asserting every origin the bundle actually fetches from is permitted, that both configs agree, and that the directive is not opened to a bare wildcard. The bug was invisible without a test precisely because the call sites degrade quietly.
- Found by loading the pull request's Vercel preview in a browser and reading the console, which is also how the hash-based `script-src` change was confirmed safe.
- Note: the `mccal-media` Supabase project is currently paused, so these two features stay on their fallbacks until it is resumed. The CSP fix means they will work once it is, rather than being blocked a second way.

### Sentry Off the Critical Path

- Blocking JavaScript on the public site drops from ~175 KB to ~118 KB gzip, and from ~222 KB before this week's work — a 47% cut overall. Nothing paints on a client-rendered SPA until that JS lands.
- The Sentry SDK (~57 KB gzip) no longer loads synchronously. `src/lib/sentry-lazy.ts` installs `error` / `unhandledrejection` handlers immediately, queues anything they catch, then loads and initializes the SDK after the `load` event and replays the queue into it. Boot-time errors are still reported; they just arrive slightly later.
- The queue is bounded at 20 entries so an error loop during boot cannot grow it without limit.
- `instrument.ts` now exports `initSentry()` instead of running on import, so nothing in the critical path statically depends on it.
- Dropped `wrapCreateBrowserRouterV6`. It has to run at module scope to build the router, which forced the whole SDK into the entry chunk. Route-pattern transaction names — the main thing it provided — are now set from `RouteAnalytics` using the same `getSpeedInsightsRoute` helper Speed Insights already uses, so Sentry still sees `/blog/[slug]` rather than one transaction per post.
- When no Sentry DSN is configured the SDK is never fetched at all. Previously a DSN-less build still downloaded it.
- Ratcheted the `jsKb` performance budget from 200 to 150 now that there is real headroom. A budget far above actual usage catches nothing.

### Hero Preload No Longer Discarded

- `HeroCarousel` fetched Supabase slides on mount and could replace slide 0 — the LCP element that `index.html` preloads — throwing the preload away and restarting LCP after a full round trip. The fetch now waits for the `load` event, so the preloaded hero paints first and database-managed slides swap in afterwards at no cost.
- Fixed the fetch's timeout handling: `clearTimeout` only ran on success, so a failed request left a pending abort timer for the rest of the component's life.

### Content Security Policy Hardened

- `script-src` no longer allows `'unsafe-inline'`. The two inline scripts in `index.html` (theme-flash prevention, hero preload) are allowed by SHA-256 hash instead, closing the main XSS gap in an otherwise strong header set.
- Added `csp-inline-hashes.test.ts`, which recomputes the hashes from `index.html` and fails if either config drifts, if `'unsafe-inline'` returns, or if a hash is left behind for a deleted script. Without it, editing an inline script would silently break the page in production.
- Verified in a browser against a server enforcing the production CSP: both inline scripts execute, no violations are reported, and an inline script whose hash is not allowlisted is correctly blocked.

## 2026-08-08

### Critical-Path Bundle Diet

- Cut blocking JavaScript on the public site from ~222 KB to ~174 KB gzip (-21%). The site is a client-rendered SPA, so nothing paints until that JS lands — this moves FCP, TBT, and INP directly, and LCP as a knock-on.
- Session Replay (rrweb, 41 KB gzip) no longer ships in the critical path. It was listed in `Sentry.init`'s `integrations`, which put it in the entry chunk; it now loads through a dynamic import after the `load` event. Imported from `@sentry/replay` rather than `@sentry/react` on purpose — the latter is already in the static graph, so a dynamic import of it resolves to the same module and Rollup has nothing to split off. Added `@sentry/replay` as an explicit dependency pinned to the SDK version.
- Not using Sentry's `lazyLoadIntegration()`: it fetches from Sentry's CDN, which the `script-src` CSP in `vercel.json` blocks.
- Replaced `import * as Sentry` with named imports in `main.tsx`, `App.tsx`, `instrument.ts`, and `ErrorBoundary.tsx`. Namespace imports defeat tree-shaking and pulled the full SDK into whatever chunk referenced them.
- Added a `sentry-vendor` chunk, and pinned the replay packages to their own `sentry-replay` chunk — `@sentry/browser` statically re-exports `replayIntegration`, so without an explicit rule Rollup folded rrweb back into the eager chunk.
- Lazy-loaded `PodcastPage`, which was the one route imported eagerly in `App.tsx` and therefore shipped to every visitor on every route. `HomePage` stays eager because it is the LCP route.
- Entry chunk: 129.8 KB gzip to 25.7 KB.

### Performance Budget Actually Runs

- `check-performance-budget.js` counted only resources with `initiatorType === 'script'`, which is the entry chunk alone. Vite emits vendor chunks as `<link rel="modulepreload">` (initiatorType `link`), so roughly 150 KB of blocking JS was invisible to the budget. Now matched on the URL instead.
- The check ignores `/_vercel/*` responses, which are served by Vercel's edge and always 404 against a local `vite preview` — that alone failed every route.
- Repointed `playwright-performance.yml` at `npm run perf:budget` and re-enabled it on PRs touching `sites/mcc-cal-vite/**`. It had been disabled and still aimed at the retired `src/widgets/` paths, so the budget was never enforced.

### Dependabot Automation Unblocked

- Exempted Dependabot from the `require-changelog` guard: the bot never edits `CHANGELOG.md`, so the check could only ever fail and hold its PRs out of the auto-merge queue. Human PRs are still enforced.
- Exempted Dependabot from the Copilot Instructions Guardian: dependency bumps match its `package.json` / `scripts/**` / `.github/workflows/**` paths filter but never change the repo behavior those instruction docs describe.
- Restored `fetch-depth: 0` on the Copilot Instructions Guardian checkout. It had been set to `2`, but the job diffs `base.sha...head.sha` and a shallow clone does not contain the base commit, so the guard failed with `fatal: bad object <base sha>` on every pull request rather than actually checking anything.
- Made the Dependabot auto-approve step non-fatal. It fails with `GitHub Actions is not permitted to approve pull requests` unless the repository setting is enabled, which was reporting a red check on every bot PR.

## 2026-08-06

### Technical Portfolio at dev.mcc-cal.com

- Added `sites/mcc-cal-dev`, a standalone Vite + React app for the technical product portfolio. Separate Vercel project, own design system, own CSP, mirroring the `sites/mcc-cal-admin` precedent. Software work is no longer presented through a layout built for photographs.
- Design system built on the McCal Media brand palette (Business Marketing Kit): warm charcoal ground, bone text, no accent chroma. Two values are interpolated rather than taken from the kit, both documented in `src/styles/tokens.css`: `--bg` extends the ramp darker for a screen ground, and `--dim` replaces the kit's `5B5553`, which is only 2.4:1 on the page background and fails AA at the metadata size.
- Typography is Plus Jakarta Sans with IBM Plex Mono for metadata, both self-hosted as woff2 under `public/fonts/`. `font-src 'self'` means no external font host can load.
- Content is a typed schema in `src/content/`. Adding a project is one entry in `projects.ts`; the index row, route, metadata table, and sticky section nav all derive from it. Projects without a written case study render an index row with no link rather than a page of filler.
- Status is communicated by shape and text, never color alone (`StatusMarker`). Preview slots for captures that do not exist yet reserve the aspect ratio and say "capture pending" instead of showing stock imagery.
- Fixed a latent scrollspy bug in `SectionNav`: the IntersectionObserver callback read only the `entries` delta, which goes stale when one scroll batches several section changes together. It now accumulates intersecting ids and re-derives the topmost. Not verified in a live browser, see below.

### Migrated TerraNova, Roadmap, and Abridgd off the photography site

- Removed `/terranova` and `/roadmap` from `sites/mcc-cal-vite`: routes, `public-routes.js`, `site-navigation.ts`, `pageSeoData.json`, and the page sources. Prerendered route meta drops from 31 to 29 pages.
- Added permanent cross-domain redirects for both paths to `dev.mcc-cal.com`, in the root and app `vercel.json` (kept in sync per `vercel-config.test.ts`).
- Deleted the orphaned, unrouted `abridged.tsx`, `abridged.module.css`, `styles/abridged.css`, and `data/abridged-data.ts`. Updated `seo.static.test.ts`, which read the deleted page.
- `/projects` now lists the software work as external links to `dev.mcc-cal.com`; the About bio menu's Roadmap link points there too.
- The dev site's roadmap deliberately did not carry over most of `roadmap-data.ts`. That content was a photography-business roadmap (service launches, client portal, marketplace, AI features) and does not belong in a technical publication. Only the software work that actually shipped or is actually queued survived.
- Fixed a false positive in `ci-validate-workflows.js` and `ci-validate-scripts.js`. Both matched script references with a bare `scripts/...` pattern and resolved the result from the repo root, so an app-relative path like `sites/mcc-cal-dev/scripts/sync-github.js` had its leading directories chopped off and was reported as a missing file. They now match the full path.

## 2026-07-15

### Local Website Workflow

- Added a local-first website workflow covering non-Drive checkouts, human-readable branch names, local verification, local site testing, and PR preview gates.

## 2026-07-14

### Portfolio Lightbox Local Image Loading

- Fixed local Vite development for sparse checkouts by redirecting missing portfolio image files to the repo CDN instead of returning HTML to the lightbox.
- Preserved natural image aspect ratios in the lightbox by fitting loaded images to the available stage by width or height.

## 2026-07-11

### Supabase Schema Tracking & Image Width Guard

- Mirrored all four live-database migrations into `supabase/migrations/` (initial schema, RLS policies, portfolio_images, hero_slides) so the repo is the source of truth; removed the stale, never-applied `20260625000000_portfolio_images.sql` duplicate.
- Added `20260711000000_tighten_public_form_table_policies.sql` dropping the over-permissive anon policies on `contact_submissions` and `quote_requests` (anon SELECT `USING (true)` exposed submitted PII to anyone with the public anon key; anon INSERT bypassed the API's spam protections). Not yet applied to the live database.
- Added `imageWidths.static.test.ts`: every image width requested from Vercel's Image Optimization API must be in `vercel.json`'s `images.sizes` allowlist, preventing the hero-slideshow "Image unavailable" bug class.

### Portfolio Lightbox Fixes & Polish

- Added an error state with a retry button when a lightbox photo fails to load (previously the loading spinner spun indefinitely).
- Neighbor-photo preloading now uses the same `srcset`/`sizes` as the visible image so the browser cache hits on next/previous.
- Zooming keeps the viewed point stable (was snapping to the top of the image); double-click zooms toward the clicked point.
- Added mouse drag-to-pan while zoomed and horizontal touch-swipe navigation when not zoomed.
- Sharper image while zoomed: `sizes` scales with the zoom factor so a larger srcset candidate is fetched.
- Zoom buttons use `aria-disabled` instead of `disabled` at their bounds so keyboard focus stays inside the dialog.
- `role="group"` on the thumbnail strip, `96dvh` dialog height on mobile, removed a dead ref.
- Added `PortfolioLightbox` unit tests (error/retry, zoom bounds, keyboard navigation, swipe, Escape).

## 2026-06-14

### Sentry Observability & Repository Hygiene

- Added Sentry error/performance monitoring to frontend (`src/instrument.ts`, `src/lib/sentry-config.ts`) and API routes (`api/_lib/sentry.js`).
- Fixed `captureApiException` to be async with `Sentry.flush(2000)` so envelopes are not dropped when Vercel serverless functions terminate. Updated all API call sites to `await` the helper.
- Removed duplicate `onCaughtError: Sentry.reactErrorHandler()` from `main.tsx`; `ErrorBoundary.componentDidCatch` is the single capture path for boundary-caught errors.
- Added `preconnect`/`dns-prefetch` resource hints for CDN origins in `index.html`.
- Added Vitest coverage thresholds and `test:coverage` script.
- Created `tsconfig.test.json` and `typecheck:test` script so test files are included in TypeScript type-checking.
- Removed unused `react`/`react-dom`/`@types/react*` from root `package.json`.
- Moved audit reports to `docs/archive/`; rewrote `docs/repo-improvement-plan.md` for current Vite architecture.
- Added `.gitleaks.toml` to allowlist `.env.example` template files.

## 2026-06-02

### CI / Workflow Stability

- Fixed GitHub Actions guard scripts to use the `github.rest.issues` namespace required by `actions/github-script@v9`.
- Compacted the Auto-Generate Manifests matrix output before writing to `$GITHUB_OUTPUT`.
- Added individual root manifest script aliases for nature, portrait, featured, and universal portfolio generators so the Auto-Generate Manifests workflow can run each matrix job.
- Fixed the reusable commit-and-push action to parse multiline file lists before staging generated manifest artifacts.
- Updated the Gitleaks checkout to use full history for commit range scans.
- Adjusted the events page manifest test to read the tracked static events manifest fixture.

## 2026-04-24

### SEO Enhancements & Open Graph Images

- Added portfolio-specific Open Graph images (`portraits-og.jpg`, `nature-og.jpg`, `events-og.jpg`, `concerts-og.jpg`) to `public-vite/images/`.
- Updated portfolio pages (portraits, nature, events, concerts) to use specific OG images instead of generic headshot.
- Added event schema generators (`generateEventSchema`, `generateMusicEventSchema`) to `jsonLd.ts` for future event structured data implementation.
- Created debug workflow documentation (`.windsurf/workflows/debug.md`) with systematic 12-step debugging process.

### CSS Reorganization

- Moved CSS files from centralized `styles/` directory to component/page co-location pattern:
  - `ComingSoon.module.css` → `components/ComingSoon.module.css`
  - `heroCarousel.module.css` → `components/heroCarousel.module.css`
  - `authors.css` → `pages/authors.css`
  - `blog.css` → `pages/blog.css`
  - `podcast.css` → `pages/podcast.css`
- Updated all component and page imports to reflect new CSS locations.
- Added Tailwind configuration file (`tailwind.config.js`).

### GitHub Actions Improvements

- Added consistent caching strategy across all workflows (npm + node modules).
- Added timeout settings to prevent hanging jobs (10-30 minutes based on job type).
- Added concurrency groups to prevent redundant workflow runs.
- Added npm audit job to security scanning workflow.
- Moved hardcoded URLs to secrets with fallbacks in `seo-auto-update.yml`.
- Improved `reusable-manifest.yml` with caching and timeout configuration.

### Code Quality

- Fixed ESLint warnings in `generate-favicons.js` (removed unused `icoBuffers` variable).
- Fixed ESLint warning in `validate-manifests.js` (removed unused error parameter).

## 2026-03-30

### Session Timeline

#### 13:32 EDT - `6ebf89ff` `refactor(blog): consolidate canonical content pipeline`

- Canonicalized the active blog system under `src/content/blog/` with `authors.json`, `posts/<slug>/post.json`, and generated `blog-manifest.json`.
- Rewired shared blog types/loaders plus the Vite blog utilities, showcase components, and static test flow away from the legacy `/api/v1/blog`, `src/data/blog`, and `src/site/blog` assumptions.
- Updated blog feed generation to use the canonical content tree.

#### 13:33 EDT - `cfc21331` `feat(blog): add markdown-first authoring workflow`

- Added `post.md` as the preferred authored blog source, with compile and migration scripts that generate runtime `post.json` files for the site.
- Updated Google Docs ingestion to write Markdown first, then compile posts, rebuild the manifest, and regenerate feeds.
- Synced the Vite prebuild flow so blog Markdown is compiled before local preview/build output is copied.

#### 13:33 EDT - `9a8f3ab8` `docs(blog): document canonical markdown workflow`

- Updated repo docs and agent instructions to reflect the canonical `src/content/blog` workflow and Markdown-first authoring model.
- Added the root README blog workflow section so the authoring commands and content paths are discoverable in one place.

#### 13:35 EDT - `4418bc13` `feat(seo): include blog URLs in sitemap`

- Updated `seo:sitemap` to include `/blog` and canonical blog post URLs from `src/content/blog/blog-manifest.json`.
- Added lead-image sitemap entries for blog posts where available.

#### 14:10 EDT - Working Tree: blog validation + Speed Insights

- Added `blog:validate` to the canonical blog pipeline and wired it into `manifest:blog`, Google Docs sync, and the Vite static sync step so broken blog metadata or local assets fail before publish.
- Added Vercel Speed Insights to the Vite app entrypoint and app package for production performance telemetry using the official package integration.

#### 14:25 EDT - Working Tree: homepage hero + nav alignment

- Fixed the React nav so the homepage now applies the existing `is-home` transparent-nav treatment instead of rendering the scrolled variant immediately.
- Replaced the autoplay homepage carousel with a static editorial hero grid that sits under the nav more like the live site, while prioritizing the lead image and reducing client-side hero logic in line with production-readiness guidance.

#### 15:05 EDT - Working Tree: homepage sections + CSS cleanup

- Added below-the-fold homepage sections for selected work, latest blog posts, podcast spotlighting, and clearer call-to-action paths so the landing page continues past the hero.
- Moved the Google Fonts `@import` to the top of `globals.css` so the Vite/PostCSS build no longer warns about import order.

#### 15:44 EDT - Working Tree: temporary live-site fallback layer

- Centralized temporary `mcc-cal.com` and Squarespace CDN homepage dependencies into a single Vite fallback module so the bridge to the legacy site is explicit and easier to remove later.
- Updated the hero, homepage featured cards, and podcast spotlight to reuse that fallback layer, while allowing generated featured-manifest data to fill in when local media is available.

## 2026-03-05

### Docs/Meta

- Rewrote `.github/copilot-instructions.md` into a concise, repo-specific operational guide.
- Consolidated core guardrails from standards/README sources (architecture scope, manifest policy, widget conventions, performance/a11y doctrine, script organization, and security baseline).
- Reduced historical verbosity in instructions and clarified that deep change history belongs in `CHANGELOG.md` and `docs/**`.

## 2026-02-02

### Standards — February 2026 Hardening Addendum

- Documented security/a11y/perf rules for widgets that ingest external data (RSS/manifests) and run in host CMS blocks. Highlights: escape+validate all external strings/links, scope CSS to widget root, avoid global token overrides, align control semantics (hide vs stop), persist user-set volume, keyboard-friendly controls, resilient “Start Here” fallbacks, disciplined observers for auto-load behaviors, and PATCH-level changelog/version hygiene.
- Files: `docs/standards/widget-standards.md`

## 2026-01-10

### Events Portfolio Update

- **New Content**: Added "University of Pittsburgh Winter Graduation 2024" gallery with 69 new images.
- **Optimization**: Processed 118 event images with optimization script, reducing file size by ~1GB.
- **Manifest**: Regenerated `events-manifest.json` to include new content.

### Podcast Feed Widget v2.2.2 [Optimization]

- **Link Fix**: Updated the "Let's Grab a Drink!" button to point directly to the Caffeinated Connections Calendly page (`https://calendly.com/cjmccar-mcc-cal/caffeinated_connections`).
- **Performance**: Added `loading="lazy"` to podcast episode avatars to improve initial page load performance.
- **Files**: `src/widgets/_content/podcast-feed/versions/v2.2.2-podcast-optimization.html`

### Featured Portfolio Widget v1.5.1 [LCP Optimized]

- **LCP Optimization**: Pre-rendered the primary hero card (Horseburner) in HTML to ensure immediate visibility and fix LCP metric.
- **Layout Stability**: Modified shuffle logic to prioritize and pin the LCP element to the top of the grid to prevent layout shifts (CLS) during hydration.
- **Performance**: Enforced `loading="eager"` and `fetchpriority="high"` for the hero image.
- **User Experience**: Removed the forced loading spinner, allowing the pre-rendered content to represent the initial state.
- **Files**: `src/widgets/portfolios/featured-portfolio/versions/v1.5.1-featured-optimization.html`

### Roadmap Widget v1.5.0 [Dual Timeline]

- **Dual View Toggle**: Implemented a "Life & Photography" vs "Web Development" toggle to showcase both career paths side-by-side.
- **Dynamic Content**: Header, description, and timeline milestones update dynamically based on the selected mode.
- **Life Roadmap**: populated with milestones from university, newspaper editor roles, and freelance expansion.
- **Files**: `src/widgets/_content/roadmap/versions/v1.5.0-roadmap-dual.html`

### Roadmap Widget v1.4.0 [Dynamic]

- **Live Activity**: Integrated direct GitHub API fetching to display real-time commit activity and the latest update message dynamically.
- **Visuals**: Added a "Latest Update" highlight that injects the most recent commit message into the timeline.
- **Files**: `src/widgets/_content/roadmap/versions/v1.4.0-roadmap-live.html`

### Footer Widget v1.4.0

- **Navigation**: Added a direct "Roadmap" link to the About/Connect section for easy access to the development journey.
- **Files**: `src/widgets/_navigation/site-footer/versions/v1.4.0-footer-roadmap.html`

### About Widget v2.4.2

- **Navigation**: Added "Roadmap" link pointing to the Development Roadmap in the "Documents" dropdown menu.
- **Files**: `src/widgets/_content/about/complete-about-page/versions/v2.4.2-about-roadmap.html`

## 2026-01-06

### Docs/Meta

- **Performance Intent (Authoritative)**: Added a new section to `.github/copilot-instructions.md` establishing a performance-first development doctrine. This prioritizing real-user experience (LCP, main-thread) on `mcc-cal.com` over synthetic metrics and mandates specific architectural rules for above-the-fold content and JS usage.

### Repository Hygiene

- **Widget Version Enforcement**: Archived excess versions for `photojournalism-portfolio` and `portrait-portfolio`. All widgets now comply with the ≤2 active versions policy (0 violations).

### Podcast Feed Widget v2.2.1

- **Bug Fix**: Restored missing `previewAudio` function that was accidentally omitted in v2.2.0, making the "Preview 15s" button functional again.
- **Enhanced Cleanup**: Added proper cleanup of preview timers and event listeners in audio control functions to prevent memory leaks and ensure smooth transitions between preview and full playback modes.
- **Cache Update**: Updated cache key to `podcast-feed-episodes-v2.2.1` for clean cache transitions.
- **Files**: `src/widgets/_content/podcast-feed/versions/v2.2.1-podcast-preview-fix.html`

### Podcast Feed Widget v2.2.0

- **Core Refactor**: Standardized the widget on a high-performance event delegation architecture.
- **"Load More" Feature**: Added a "Load More Episodes" button for paginated display of the full RSS catalog.
- **UI Refinement**: Implemented a "Read More" toggle for the podcast description with smart truncation point.
- **Aesthetic Alignment**: Neutralized play button colors to match the site's glassmorphic design.
- **Changelog Modal**: Added a clickable version indicator that triggers a detailed update modal.
- **Files**: `src/widgets/_content/podcast-feed/versions/v2.2.0-podcast-core.html`

### Podcast Feed Widget v2.1.0

- **Resilience Refinement**: Improved proxy fallback chain for RSS fetching.
- **Feature Parity**: Added "Read More" toggle, "Load More" button, and Changelog modal to match v2.2.0 functionality.
- **Files**: `src/widgets/_content/podcast-feed/versions/v2.1.0-podcast-resilience.html`

## 2025-12-31 (Continued)

### Repository Cleanup & 2026 Optimization

**Phase 1 Complete** - Streamlined repository structure for efficient 2026 work:

- **Documentation Archive**: Moved 9 Phase-2 completion documents to `docs/archive/phase-2/` (PHASE-2-\*.md, API-DEPLOYMENT-COMPLETE.md, WIDGET-HOT-RELOAD-FEATURE.md)
- **Test Organization**: Consolidated test/preview files to `tests/previews/` (preview-monochrome-nav.html, test-blog-admin.html)
- **Session Archive**: Moved historical session summaries to `docs/archive/sessions/`
- **System Cleanup**: Removed all `.DS_Store` files (9 instances) and `nohup.out` from repository
- **.gitignore Optimization**: Removed duplicate entries, added patterns for `.git-rewrite/`, `.turbo/`, `nohup.out`, and `tests/previews/*.html`
- **Root Directory**: Reduced from 39 files to 30 production-relevant files
- **Documentation**: Created comprehensive cleanup plan (`docs/2026-REPO-CLEANUP-PLAN.md`) and execution summary (`docs/2026-CLEANUP-SUMMARY.md`)
- **Validation**: All widgets pass HTML validation, repository health checks pass

**Next Steps**: Phase 2 (dependency updates) and Phase 3 (structural improvements) planned for Q1 2026.

### Repository Cleanup & 2026 Optimization - Phase 2

**Phase 2 Complete** - Updated dependencies to latest safe versions:

- **Package Updates**: Updated 7 packages (@eslint/js 9.39.2, @playwright/test 1.57.0, autoprefixer 10.4.23, express 5.2.1, jsdom 27.4.0, typescript-eslint 8.51.0, playwright 1.57.0)
- **Validation**: All widgets pass HTML validation, repository health checks pass
- **Security**: Improved security posture with latest patches (1 moderate esbuild issue deferred to Phase 3)
- **Compatibility**: No breaking changes, all updates backward compatible
- **Deferred Updates**: Major version updates (ESLint 9, React 19, Tailwind 4, esbuild 0.27) deferred to Q1 2026 for thorough testing
- **Documentation**: Created comprehensive Phase 2 summary (`docs/2026-PHASE-2-SUMMARY.md`)

**Node.js Recommendation**: Consider upgrading to Node.js 20.19+ or 22.x LTS for optimal package compatibility.

### Repository Cleanup & 2026 Optimization - Phase 3

**Phase 3 Complete** - Structural improvements and security fixes:

- **Security Fix**: Updated esbuild 0.23.1 → 0.27.2, resolving moderate CORS vulnerability (GHSA-67mh-4wv8-2f99). **0 vulnerabilities** ✅
- **Documentation Consolidation**: Merged `docs/automation/` into `docs/workflows/`, moved `scripts/agents/` to `docs/agents/` for clearer organization
- **Widget Versioning**: Scanned all widgets, confirmed compliance with ≤2 active versions policy
- **Package.json Analysis**: Analyzed 109 npm scripts, created backup, identified deprecated scripts for future removal
- **Validation**: All widgets pass HTML validation, repository health checks pass
- **Documentation**: Created comprehensive Phase 3 summary (`docs/2026-PHASE-3-SUMMARY.md`)

**Deferred to Q1 2026**: Package.json reorganization (109 scripts require careful categorization and testing)

**All 3 Phases Complete!** Repository is now fully optimized for 2026.

### Widget Monochrome & Navigation Refinements

- **Policies & Legal v1.1.1**:
  - **Full Content Restoration**: Restored the complete legal sections (License, Privacy, Cookies, Terms) and the comprehensive 7-item FAQ from the original release.
  - **Advanced Navigation**: Implemented a real-time table of contents search (discovery), reading progress bar, and estimated reading time indicator.
  - **Download Bar Expansion**: Added direct 'License PDF' and 'Print/Save' buttons alongside the original Terms PDF request.
  - **UI Refinement**: Resolved contrast issues by enforcing high-contrast white text for all interactive buttons and links.
  - **Spacing Audit**: Improved vertical rhythm and spacing throughout the document, including section margins and header breathing room for better readability.
  - **Section Precision**: Added persistent heading anchors (§) for direct linking to specific legal clauses.
  - **FAQ Accordion**: Implemented a monochrome-styled dropdown for the FAQ section using `<details>`/`<summary>`.
  - **SEO Restoration**: Restored missing FAQPage, WebPage, and BreadcrumbList structured data for better search indexing.
  - **Files**: `src/widgets/_content/policies-legal/versions/v1.1.1-policies-legal-monochrome.html`

- **Podcast Widget v2.1.0**:
  - **Brand Simplification**: Removed "2.0" from the header as requested. The title now cleanly displays "Latest Episodes".
  - **Internal Metadata**: Maintained technical versioning in the indicator for development tracking.
  - **Files**: `src/widgets/_content/podcast-feed/versions/v2.1.0-podcast-resilience.html`

- **Photojournalism v5.5.1**:
  - **Modal Visibility Fix**: Resolved 'all white' modal bug by enforcing a dark glassmorphic background and white text within the lightbox.
  - **Files**: `src/widgets/portfolios/photojournalism-portfolio/versions/v5.5.1-photojournalism-monochrome.html`

### Footer Widget v1.3.0

- **Back to Top Button**: Added circular floating button with scroll progress ring indicator that appears after 400px scroll
- **Smart Positioning**: Button automatically hides when approaching footer to prevent overlap
- **Enhanced Link Interactions**: Added animated underline effect on hover for all footer links
- **Social Icon Tooltips**: Platform names now appear on hover with smooth fade-in animation
- **Newsletter Form States**: Added loading spinner, success message with checkmark animation, and visual validation feedback
- **Version Interactivity**: Made version badge clickable (prepared for future changelog modal)
- **Dynamic Copyright**: Year range now displays "2019-2025" format when applicable
- **Improved Accessibility**: Enhanced focus states, keyboard navigation for Back to Top, and ARIA live regions for form feedback
- **Performance**: Smooth scroll behavior, optimized animations with reduced-motion support
- **Files**: `src/widgets/_navigation/site-footer/versions/v1.3.0-footer-back-to-top.html`

### About Widget v2.4.0

- **Client Carousel Update**: Added PGH Social Club and PRSSA Pittsburgh to the client carousel, bringing the total to 27 premium clients.
- **Logo Consistency**: Updated OSH360 logo to use white filter treatment instead of grayscale for visual consistency with other client logos.
- **Files**: `src/widgets/_content/about/complete-about-page/versions/v2.4.0-about-pgh-social-club.html`

### About Widget v2.3.0

- **Contact Link Update**: Migrated the "Grab a Coffee" link to the new endpoint: `https://calendly.com/cjmccar-mcc-cal/30min`.
- **Schema Optimization**: Updated JSON-LD structured data with the new contact URL for improved SEO and consistency.
- **Files**: `src/widgets/_content/about/complete-about-page/versions/v2.3.0-about-coffee-link.html`

## 2025-12-30

### Navigation Widget v2.0.0 (The Refined Lens)

- **Mimicry of v1.6.3**: Restored the classic full-width desktop bar and right-aligned mobile menu for a sophisticated asymmetrical look.
- **Focus Flow Effect**: Unique "Neighbor Dimming" interaction on desktop that subtly fades non-hovered items.
- **Micro-Refinement**: Utilized 0.5px ultra-minimal borders and cinematic ease-out transitions.
- **Native Efficiency**: Cleaned up the navigation engine for smoother performance across route changes.
- **Files**: `src/widgets/_navigation/site-navigation/versions/v2.0.0-site-navigation.html`

### Navigation Widget v1.9.7

- **Expanded Mobile Profile**: Widened the mobile menu container to `230px`.
- **Left-Aligned Flow**: Switched all mobile navigation text and internal components to left-alignment for a cleaner reading line.
- **Improved Hierarchy**: Restored the toggle arrow to the right of the "Work" label to complement the left-aligned flow.
- **Files**: `src/widgets/_navigation/site-navigation/versions/v1.9.7-site-navigation.html`

### Navigation Widget v1.9.6

- **Refined Mobile Profile**: Significantly narrowed the mobile menu box to `185px` for a tighter, more vertical aesthetic.
- **Micro-Scaled Typography**: Reduced mobile link sizes (Primary: `1.25rem`, Submenu: `1.05rem`) to better fit the compact layout.
- **Uniform Presence**: Implemented a solid `24px` uniform padding on all sides of the mobile navigation overlay.
- **Files**: `src/widgets/_navigation/site-navigation/versions/v1.9.6-site-navigation.html`

### Navigation Widget v1.9.5

- **Right-Aligned Mobile Experience**: Switched the mobile menu container and internal items back to right-aligned for an asymmetric editorial feel.
- **Enhanced Typography**: Boosted mobile link sizes to `1.45rem` and submenu items to `1.15rem` for significant visual impact and readability.
- **Tightened Interaction**: Refined the placement of the "Work" toggle arrow to sit tightly against the text while maintaining flush right alignment.
- **Files**: `src/widgets/_navigation/site-navigation/versions/v1.9.5-site-navigation.html`

### Navigation Widget v1.9.4 (Consolidated Release)

- **Minimalist Quote CTA**: Ghost-style button with refined editorial typography (Standard weight, uppercase).
- **Floating Lens Submenus**: Desktop dropdowns with vertical gaps, unified rounding, and scanable left-aligned text.
- **Centered Mobile UI**: Compact, centered "Lens" overlay (`220px` width) for a symmetrical mobile experience.
- **Visual Polish**: Advanced glassmorphism (24px blur), soft chip hover states, and tightened layout spacing.
- **Files**: `src/widgets/_navigation/site-navigation/versions/v1.9.4-site-navigation.html`

### Quote Request Widget v1.1.0

- Upgraded to a multi-step slide transition architecture (3 steps: Contact, Details, Budget).
- Added canvas-confetti celebration upon successful submission.
- Implemented `localStorage` draft persistence to prevent data loss.
- **Files**: `src/widgets/_content/quote-request/versions/v1.1.0-quote-multistep.html`

### Quote Request Widget v1.0.0

- Created a conversion-focused "Request a Quote" form for McCal Media.
- **Features**:
  - Comprehensive service-based fields (Event, Headshots, Brand, editorial).
  - Conditional logic for event-specific details (times, attendance).
  - Detailed licensing & usage section for commercial pricing.
  - Integrated EmailJS handling (consistent with contact-form).
  - Anti-spam honeypot and monochrome responsive UI.
  - Built-in versioning and changelog modal.
- **Files**: `src/widgets/_content/quote-request/`

### About Widget v2.2.0

- Added scroll-triggered entrance logic (reveals after 400px scroll).
- Implemented periodic pulse micro-interaction for the CTA button.
- Added collision detection to hide the CTA when nearing the footer.
- **Files**: `src/widgets/_content/about/complete-about-page/versions/v2.2.0-about-enhanced-cta.html`

### About Widget v2.1.0

- Added a floating "Request a Quote" CTA button with a high-contrast monochrome design.
- Redirects users directly to the new quote request page for better conversion.
- Updated versioning and internal changelog.
- **Files**: `src/widgets/_content/about/complete-about-page/versions/v2.1.0-about-quote-cta.html`

## 2025-12-08

### Manifest Proxy & Shared Date Parsing Symlink

- **Manifest Proxy in Dev:** WidgetEmbed now rewrites manifest URLs in injected widget HTML in dev mode, so widgets load manifests from the local API endpoint (e.g., `/api/manifests/events`) instead of GitHub. This ensures widgets work locally and in CI/dev environments without manual HTML edits. See WidgetEmbed.tsx for details.
- **Shared Date Parsing Symlink:** To resolve CI and local import errors, a symlink was created: `scripts/utils/shared-date-parsing.js` → `../../src/api/scripts/utils/shared-date-parsing.js`. All manifest generators now use the canonical shared date parsing utility. If you move or update the canonical file, update the symlink accordingly. Do not edit or restore the archived copy in `scripts/_archived/`.

### Concert Manifest API Reliability & Horseburner Fix

- **Cloudflare Manifest API Mapping:** Added an explicit `MANIFEST_CONFIG` map plus a GitHub Raw fallback inside `tools/cloudflare/complete-worker.js`, guaranteeing `/api/v1/manifests/:type` resolves every portfolio even when `MANIFEST_BASE_URL` is unset. Auto-manifest workflows and Squarespace widgets now receive consistent data again.
- **Concert Manifest Generator v1.1.0:** `scripts/manifest/generate-concert-manifest.js` now imports `resolveDateOverride`, records `relativeFolderPath`, `dateSource`, `dateConfidence`, and optional notes, and emits a normalized `items[]` collection (with `src/...` paths) for easier widget consumption.
- **Concert Widget v4.7.1 Parity:** Updated `src/widgets/portfolios/concert-portfolio/versions/v4.7.1-api-optional.html` to normalize manifest entries (absolute URLs, relative paths, filenames) before building image URLs and alt text. Horseburner’s new December 2025 gallery now loads correctly through both API and GitHub fallbacks.
- **Manifest Regeneration:** Ran `npm run manifest:concert` after the generator changes (601 images / 25 bands). Local webhook notifications still expect the Cloudflare dev server but report warnings only; manifests themselves regenerate cleanly.

## 2025-11-23

### Version Standardization (x.x.0 Format)

- Concert Portfolio: 19 versions (v2.0.0 → v4.7.0)
- Photojournalism Portfolio: 12 versions (v1.0.0 → v5.2.0)
- Podcast Feed: 12 versions (v1.0.0 → v2.0.0)
- Featured Portfolio: 6 versions (v1.0.0 → v1.5.0)
- Nature, Event, Hero, Portrait, Navigation, Video: 14 versions
- `scripts/utils/standardize-versions.js`: Updates version strings in code content
- `scripts/utils/rename-widget-versions.js`: Renames version files to x.x.0 format
- Both support `--dry-run` mode for safe previewing
- `versions:standardize`: Run version content updates
- `versions:check`: Preview version content changes (dry-run)
- `versions:rename`: Run file renaming
- `versions:rename-check`: Preview file renames (dry-run)

## 2025-11-24

### SEO Automation & Workflow Enhancements

- **Enhanced SEO Scripts**: Major improvements to `scripts/seo/generate-sitemap.js` and `scripts/seo/generate-structured-data.js`:
  - Added comprehensive widget support (concert, photojournalism, event, nature, portrait, featured portfolios)
  - Implemented dynamic URL generation based on widget versions
  - Added Schema.org structured data for ImageGallery, CollectionPage, and portfolio content
  - Enhanced sitemap with widget-specific lastmod dates from git history
  - Added debugging modes and validation
- **SEO Documentation**: Created comprehensive `docs/integrations/seo-automation-guide.md` and `scripts/seo/README.md` with implementation patterns, API integration benefits, and best practices.
- **GitHub Actions Workflows**:
  - `.github/workflows/seo-auto-update.yml`: Automated sitemap and structured data generation on portfolio changes
  - `.github/workflows/publish-manifests-cdn.yml`: CDN publishing automation for portfolio manifests
- **API Integration Benefits**: Documented in `docs/integrations/api-seo-benefits.md` - explains how API-driven manifests enable dynamic SEO, automated updates, and rich structured data without manual intervention.
- **Manifest CDN Documentation**: Created `docs/manifest-cdn.md` explaining jsDelivr CDN usage for manifest distribution.
- **AI Preflight Enhancements**: Updated `scripts/utils/ai-instructions-preflight.js` with improved validation and context checks (87 additional lines).

### Docs/Meta

- 2025-12-06
  - Added changelog validator workflow to require CHANGELOG updates on PRs that touch core files (bypass via labels skip-changelog/docs-acknowledged).
  - Extended widget version policy workflow to run on pushes to main for continuous enforcement.
  - AI preflight now reports widget README coverage to highlight missing docs quickly.
  - Domain audit: confirmed only intentional `mccal.media` social/email references remain; site-root URLs standardized to `mcc-cal.com`.
  - Archived orphan scripts (auto-check-todo, date-overrides, find-latest-widget-versions, shared-date-parsing, auto-manifest-updater) to `scripts/_archived/`; updated docs to point to canonical watchers.
  - Added GitHub issue templates (bug, feature) and pull request template to standardize submissions.
  - Added widget version limit workflow, PR axe audit trigger, widget registry manifest, and dev.mcc-cal.com onboarding note; added a11y checklist to widget standards.
  - Archived `generate-cdn-snippets.js` (moved from scripts/utils/ to scripts/\_archived/; not referenced by npm scripts or code).
  - Updated .gitignore to exclude scripts/.welcome-state.json (prevents local state file from being committed).
  - Confirmed all scripts/ subfolders have up-to-date README files; no missing documentation in key folders.
- 2025-12-14
  - Corrected legacy widget archive path references across docs and Copilot instructions (`src/widgets/_archived/legacy-widget-versions/` → `src/widgets/_archived/Legacy Widgets/`).
- Updated `.github/copilot-instructions.md` Recent updates section with comprehensive version standardization entry documenting problem, solution, implementation details, key lessons learned, and future maintenance guidance.

## 2025-11-03

### Workflow Validation & Portrait Portfolio Automation

- **Workflow Validation System**: Fixed corrupted `ci-validate-workflows.js` script with comprehensive validation for script references, npm ci usage, and caching best practices.
- **Portrait Portfolio Workflow**: Added `portrait-manifest.yml` for automated manifest generation on image changes in `src/images/Portfolios/Portrait/**`.
- **Repository Health Validation**: Completed full health check including smoke tests, AI preflight, large files analysis, widget validation, and workflow validation.
- **Standards Updated**: Enhanced `docs/standards/workspace-organization.md` with workflow standards and validation procedures.
- **Documentation**: Updated copilot instructions and workspace standards to reflect workflow validation patterns and cross-platform compatibility considerations.

## 2025-10-28

### Policies & Legal Widget v1.0.0 — Hotfix

- Fixed stray "-->" rendering at top by closing the initial comment block properly; no functional or visual regressions.
- Confirmed PDF download wiring via `data-terms-pdf` (with fallback), floating menu, and version badge interactions remain intact.
- Widget HTML validation: PASS.

## 2025-10-10

### Nature Manifest Generator v2.0

- Major upgrade: Now scans all animal types under Wildlife (not just Birds) and auto-generates per-species manifest.json files tagged with the animal type.
- Aggregates all animal and landscape/location collections into nature-manifest.json for portfolio widgets.
- Documentation updated in scripts/manifest/README.md to reflect multi-animal support and workflow.
- Fully tested: Adding new animal types/species auto-populates manifests and tags correctly.

## 2025-10-09 - Image Compressor

### Image Compressor App v1.6.0

- Major efficiency and robustness improvements:
  - Parallel image compression for faster batch processing.
  - Skips existing files and images already smaller than the target size, with clear error/skipped reporting in the UI.
  - Input and file type validation before processing; invalid files are rejected with user feedback.
  - Progress bar and output folder display for improved user feedback.
  - Error summary panel shows skipped, failed, and manifest validation errors after each run.
  - Manifest.json is validated after writing; errors are reported in the UI.
  - Output folder and filenames are sanitized for cross-platform safety.
  - User settings (format, quality, last used folder, etc.) are persisted and reloaded automatically.
- All changes follow widget and workspace standards for seamless integration and reliability.

## 2025-10-09 - Admin Dashboard

- Added npm script `welcome` to run the dashboard (`node scripts/admin/welcome.js`, with a wrapper left at `scripts/welcome.js`).
- Enhanced TODO auto-checker: now supports keyword and file-diff based heuristics for marking checklist items as done (see `scripts/admin/welcome.js`).
- Documented the new system in `docs/standards/widget-standards.md` and main `README.md`.
- Added pinning tip to `updates/welcome.md` for persistent dashboard visibility in VS Code.

## 2025-11-23 - Version Standardization

### Version Standardization (x.x.0 Format)

- **Complete Repository Standardization**: Converted all version numbers to Semantic Versioning 2.0.0 format (x.x.0) throughout entire repository.
- **Widget Files Renamed**: Renamed 63 widget version files from `vX.Y.html` to `vX.Y.0.html` format:
  - Concert Portfolio: 19 versions (v2.0.0 → v4.7.0)
  - Photojournalism Portfolio: 12 versions (v1.0.0 → v5.2.0)
  - Podcast Feed: 12 versions (v1.0.0 → v2.0.0)
  - Featured Portfolio: 6 versions (v1.0.0 → v1.5.0)
  - Nature, Event, Hero, Portrait, Navigation, Video: 14 versions
- **Content Updates**: Updated version strings in 33+ widget HTML files (Version: headers) and 10+ script files (@version tags in manifest generators and watchers).
- **Documentation Updates**: Updated 13 documentation files with corrected version references (READMEs, CHANGELOGs, standards guides).
- **Automation Tools Created**:
  - `scripts/utils/standardize-versions.js`: Updates version strings in code content
  - `scripts/utils/rename-widget-versions.js`: Renames version files to x.x.0 format
  - Both support `--dry-run` mode for safe previewing
- **npm Scripts Added**:
  - `versions:standardize`: Run version content updates
  - `versions:check`: Preview version content changes (dry-run)
  - `versions:rename`: Run file renaming
  - `versions:rename-check`: Preview file renames (dry-run)
- **Comprehensive Documentation**: Created `docs/standards/version-standardization-guide.md` with format rules, semantic versioning guidelines, widget-specific standards, git tagging conventions, and troubleshooting.
- **Benefits**: Fixes dropdown sorting issues (v1.10.0 now properly sorts after v1.9.0), ensures professional Semantic Versioning compliance, provides consistency across repository, and includes automation tools for future maintenance.

## 2025-11-19

### Minor Maintenance & Cleanup (v2.5.3)

- **Documentation Updates**: Updated 'Last Updated' dates in widget READMEs (about, hire-to-unlock-resume, complete-about-page) to November 19, 2025.
- **Status File Cleanup**: Removed outdated STATUS.md files for production-ready widgets (concert-portfolio, photojournalism-portfolio, portrait-portfolio). These widgets are now at stable versions (v4.7, v5.2, v1.0 respectively).
- **Package Updates**: Updated npm dependencies within semver ranges (autoprefixer 10.4.21→10.4.22, open 10.2.0→11.0.0).
- **Version Bump**: Package version updated to 2.5.3 for minor maintenance release.

### Docs/Meta — Instructions & Reorganization Phase 1

- Updated `.github/copilot-instructions.md` with Repository Reorganization Phase 1 details (centralized legacy versions archive, orphan script audit utility, composite shadow manifest workflow, STATUS template standardization, deploy script consolidation). Added validation follow-up checklist (AI Preflight, widget HTML validator, repo health check). Phase 2 TODOs logged for physical legacy file relocation and orphan script archival.

### Testimonials Widget v1.0.0

- Created production-ready testimonials widget with masonry grid layout (3/2/1 columns responsive).
- Features: 5-star rating system, 12 sample testimonials with realistic data, monochrome featured badge, Schema.org AggregateRating structured data.
- Self-contained HTML with inline CSS/JS, full WCAG 2.1 AA accessibility support.
- Files: `src/widgets/testimonials/versions/v1.0.0-testimonials.html`, README, CHANGELOG.

### Contact Form Widget v1.0.0

- Created production-ready contact form with EmailJS integration for email delivery.
- Features: Dark/light mode toggle with localStorage persistence, privacy consent checkbox, honeypot spam protection, form validation, success/error messaging, loading states.
- Configuration: EmailJS credentials configured (publicKey: VJRlr0VVGGHH4PCeN, serviceId: service_twg853m, templateId: template_bxi2j5e).
- Theme System: Full CSS variables theming, default dark mode, sun/moon toggle icon, privacy link visibility in both themes.
- Template Parameters: name, email, subject, message, consent (Yes/No), timestamp.
- Files: `src/widgets/contact-form/versions/v1.0.0-contact-form.html`, README, SETUP.md.

### Design Standards

- Established monochrome design principle for all widgets (black/white/gray color palette).
- Dark mode set as default theme preference across contact form widget.

## 2025-11-10

### Interactive Thesis Widget v0.4 — Thesis Blog Format (No Live Embed)

- New version: `src/widgets/interactive-thesis/versions/v0.4-thesis-blog-format.html`.
- Removes the live Google Docs iframe; thesis sections (Abstract, Introduction, Methodology, Findings, Conclusion) are formatted as standalone blog-style cards using blog-grid/blog-card patterns.
- Keeps curated thesis-related podcast excerpts with media-fragment audio previews and full-episode links.
- A11y: list/listitem roles, toolbar aria-pressed, keyboard navigation (arrows) between cards, Enter toggles audio; reduced motion supported.
- Validation: widget HTML validator PASS.

### Interactive Thesis Widget v0.3 — Thesis Live Embed + Thesis-related Podcast Excerpts

- New version: `src/widgets/interactive-thesis/versions/v0.3-thesis-live-excerpts.html`.
- Aligns excerpt cards with blog widget aesthetics (blog-grid/blog-card, header/body, chips) for consistent look and feel.
- Embeds the published Google Doc via iframe (auto-updates on doc changes; no scraping) and surfaces curated thesis-related podcast clips with media fragment previews.
- Accessibility: semantic article cards with roles, toolbar filters with aria-pressed, reduced motion support.
- Validation: widget HTML validator PASS.

### Interactive Thesis Widget v0.1-minimal

### Interactive Thesis Widget v0.2 — Excerpts + Inline Thesis

- New version: `src/widgets/interactive-thesis/versions/v0.2-excerpts-inline-thesis.html`.
- Adds a "Thesis Draft (Inline)" section with clearly marked TODO placeholders (Abstract, Introduction, Methodology, Findings, Conclusion) for pasting actual thesis text.
- Adds "Podcast Excerpts" grid with accessible cards, each with a quote, tag, and inline audio preview (start-end via media fragment). Links to full episode.
- Performance: still self-contained, inline CSS/JS only. Reduced-motion respected. IntersectionObserver reveal.
- Validation: widget HTML validator PASS.
- Created new self-contained widget: `src/widgets/interactive-thesis/versions/v0.1-minimal.html`.
- Features: scroll reveal (IntersectionObserver with reduced motion fallback), accessible Story Drawer (ESC + click-away, focus trap, return-focus), lazy-loaded journalism images, demo audio clip + transcript.
- Performance: inline CSS/JS (no external frameworks) keeping footprint small; uses `loading="lazy"` and `decoding="async"` for images.
- Accessibility: semantic elements, dialog role, focus trap, escape handling, reduced motion support.
- Documentation: Added widget README with usage and stretch goals (podcast clips, map overlay, journal timeline).
- Next: Add build automation & page-level SEO meta integration if promoted beyond widget embed.

## 2025-10-09 - Journalism Portfolio

### Journalism Portfolio Widget v5.1 (Work in Progress)

- Extracted all widget JavaScript to an external file (`journalism-widget-v5.1.js`) for CSP/DOMPurify compatibility and Squarespace embedding.
- Updated widget HTML to reference the external JS file via `<script src="...">` (user must update to public URL for production).
- Documented the CSP/DOMPurify issue and provided migration steps for external JS hosting.
- Widget remains marked as **Work in Progress**: lightbox and event listeners require verification in production Squarespace/CSP environments.

### Journalism Portfolio Widget v5.2 — 2025-10-09

- UI: Glass-like filter buttons with subtle outline and backdrop blur for better separation from page backgrounds.
- Behavior: Randomized selection using Fisher–Yates; widget now displays one main shuffled image per album (no duplicates) and reshuffles on each load. Added an adjacency minimizer and constrained shuffle to avoid same-folder clustering.
- Data & organization: Events that live in an `Events` folder (and items matching "rooney") are excluded from this Photojournalism feed so they belong to the Event portfolio instead.
- Filters: Removed per-category filters — the widget now exposes only "All" and "Published" filters to simplify navigation.
- Theming: Published accent switched to a muted green (`--published: #5fb189`) with a stronger hover variant (`--published-strong: #3f8f6d`).
- Config: Honor the root `data-panes` attribute (clamped between 4 and 48) to control how many cards are shown.
- Content: Subheading updated to note the portfolio currently contains political work only; more journalism will be added over time.
- Files: Changes applied to `src/widgets/photojournalism-portfolio/versions/v5.2-performance-optimized.html` and validated with the workspace HTML validator.

<!-- ...existing code... -->

## [1.6.2] - Unreleased

### Added

- Backdrop blur (with fallback) to improve text contrast while preserving background context.
- Accessibility: Escape key to close mobile menu, outside-click to close, aria-haspopup on toggle.
- Reduced motion support for users preferring less animation.
- Dev server auto-port selection (will try sequential ports if 3000 is occupied) to reduce friction when multiple sessions are open.

### Docs/Meta

- 2025-10-08: Updated about page widget v1.4.4 with refreshed bio reflecting Point Park alumni status, freelance photographer/photojournalist work, Globe photo editor role, client work extending into summer, and Kentucky project collaboration. Enhanced contact options with clean dropdown menu offering email and Calendly coffee chat booking. Removed non-functional blog button, updated portfolio link to /featured-work. Improved contact UX with elegant slide-down menu and proper Calendly integration.
- 2025-10-08: Updated `.github/copilot-instructions.md` with comprehensive repository organization standards, widget development workflows, performance standards documentation, and AI agent responsibilities. Added scripts folder organization rules, widget status workflow guidelines, and enhanced documentation for future maintainers.
- 2025-10-06: Created comprehensive `docs/standards/seo-starter-guide.md` - Practical Squarespace SEO playbook tailored for McCal Media, covering site structure, titles/meta descriptions, image optimization, structured data, internal linking, and technical hygiene implementable on Squarespace platform.
- 2025-10-06: Updated `.github/copilot-instructions.md` to reference new performance standards document (`docs/standards/performance-standards.md`) and establish Concert Portfolio v4.6 as the primary performance reference implementation for all widgets. Added performance standards to good starting references with priority star rating.
- 2025-10-06: Created `docs/standards/image-seo-standards.md` documenting comprehensive SEO best practices for portfolio images including alt text, file naming, structured data, lazy loading, and accessibility standards for improved search engine optimization and user experience.
- 2025-10-06: Scripts folder organization and archival rules documented in `.github/copilot-instructions.md`. All scripts must be organized by function (manifest, watchers, utils, admin), unused scripts archived, and all changes validated and documented for future maintainers. See instructions file for details.
- 2025-11-11: Updated AI preflight and guardian logic to dynamically discover instruction docs in `.github/` and require a CHANGELOG Docs/Meta entry when any instruction file changes. Improved ai-instructions-preflight to support `--changed` cache mode and more robust heading/bullet extraction.
- Added `.github/canvas-instructions.md` for ChatGPT Canvas usage and `.github/codex-instructions.md` for efficient VS Code agent usage under rate limits.
- Updated `copilot-instructions-guardian.yml` to enforce changelog entries when AI instructions change and to watch Canvas/Codex instruction files.
- Removed demo Event portfolio folders (Charity Gala 2024, Corporate Summit 2025, Product Launch Expo 2025) and regenerated `events-manifest.json` (now 4 real events). Cleanup documented for repository clarity.
- **Widget Standardization Complete**: Created comprehensive widget standards documentation with simplified naming:
  - `docs/standards/widget-standards.md` - Complete architecture, CSS patterns, performance guidelines, accessibility standards
  - `docs/standards/widget-reference.md` - Quick reference checklist for daily development
  - `docs/standards/README.md` - Standards directory organization and workflow guidance
  - Simplified all file names from UPPER-CASE-NAMES.md to lowercase-names.md for better organization
  - Updated main README, docs organization, and copilot instructions to reference new standards
- Created comprehensive widget enhancement framework: `docs/standards/widget-enhancements.md` documents proven optimization patterns, `docs/standards/widget-development.md` provides systematic implementation methodology for applying improvements across all widgets.
- Updated photojournalism widget documentation with enhancement pattern references and established QA standards for future widget development.

<!-- ...existing code... -->

// ...existing code...

- 2025-10-03: AI session — Validation: preflight/guardian/canvas/codex added and tasks wired
- 2025-10-03: AI session — Fixed featured portfolio widget by creating generate-featured-manifest.js script and updated widget to v1.2 with better debugging
- 2025-10-05: AI session — Updated test widgets to latest versions - journalism widget updated from v3.0 to v4.9 with latest features
- 2025-10-06: AI session — Session complete: minor updates.
- 2025-10-06: AI session — Successfully tested and fixed VS Code tasks for Copilot AI workflow. Fixed PowerShell quoting issues in widget validation task, created proper Node.js validation script, and verified all core tasks work correctly.
- 2025-10-06: AI session — Session complete: minor updates.
- 2025-10-06: AI session — Successfully implemented SEO enhancements for concert portfolio widget v4.5 including structured data, enhanced alt text generation, and accessibility improvements. Images are now loading properly and SEO features are working.
- 2025-10-06: AI session — Fixed structured data detection issues in concert portfolio widget v4.5. Updated addBasicStructuredData function to properly calculate total images from manifest bands, generate absolute image URLs, and add comprehensive metadata. Added debug functionality to check structured data locally. Structured data now includes proper Schema.org ImageGallery markup with image URLs, author info, and SEO metadata.
- 2025-10-06: AI session — Created performance-optimized concert portfolio widget v4.6 with critical CSS inlining, modern JavaScript patterns, and reduced main-thread blocking. Addresses PageSpeed issues: render blocking resources, unused CSS/JS, and long tasks. Added resource hints and lazy-loaded features.
- 2025-10-06: AI session — Created performance-optimized concert portfolio widget v4.6 with critical CSS inlining, modern JavaScript patterns, and reduced main-thread blocking. Addresses PageSpeed issues: render blocking resources, unused CSS/JS, and long tasks.
- 2025-10-06: AI session — Fixed concert portfolio widget v4.6 image loading and layout issues. Updated CSS to use responsive column-width layout with overlay info styling, matching journalism widget patterns. Images now load properly in masonry-style grid with smooth transitions and loading animations.
- 2025-10-06: AI session — Created comprehensive SEO starter guide document tailored for McCal Media's Squarespace implementation, covering site structure, titles/meta descriptions, image optimization, structured data, internal linking, and technical hygiene. Added to docs/standards/ and updated main README and CHANGELOG.
- 2025-10-06: AI session — Session complete: minor updates.
- 2025-10-09: AI session — Close Button Optimization and Navigation Hiding pattern implemented
- 2025-10-24: AI session — Successfully implemented podcast widget v1.9.5 with auto-hydrating RSS episodes. Added Ep 9 fallback data, live RSS caching, and updated show branding. Created test page that works properly. Widget now auto-populates new episodes without manual updates.
- 2025-10-24: AI session — Successfully created Portrait Portfolio v1.0 widget - portrait photography showcase with vertical composition focus, 3:4 aspect ratios, enhanced detail viewing, performance optimizations, and SEO features. Added to available widgets list and created sample manifest.
- 2025-11-03: AI session — Completed workflow validation system and portrait portfolio automation. Added comprehensive health checks and updated standards documentation.

## 1.5.0 — 2025-09-29

- Added unified-portfolio-demo.html (master demo with ?type= and ?manifest=).
- Links to unified versions for Concert, Event, and Photojournalism.

## 1.5.1 — 2025-09-29

- Refined the unified portfolio theme to mirror the live Work section aesthetic with warm neutrals and uppercase headings.
- Updated unified widget cards to surface venue/tag metadata with graceful date fallbacks from the manifest.

## 1.5.2 — 2025-09-30

- Shifted the unified portfolio experience to a monochrome gradient palette with minimal accenting for a darker presentation.
- Moved card titles and dates into on-image overlays so each gallery mirrors the live Concert layout.

## 1.5.3 — 2025-09-30

- Rebuilt the unified portfolio layout with full-width imagery, vertical scrolling, and shuffled ordering so each view spotlights only a few shots at a time.
- Updated unified widgets to respect original asset proportions and manifest metadata without overlay cropping.
