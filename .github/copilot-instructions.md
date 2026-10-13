# McCal Media Workspace — Copilot Instructions

Purpose: fast, safe, and consistent edits for the `McCals-Website` workspace.

## 1) Project reality (read first)

- Primary production target is **the Vite public app** in `sites/mcc-cal-vite/`, deployed for `mcc-cal.com`.
- The internal admin console lives in `sites/mcc-cal-admin/` and deploys as a separate Vercel project.
- The technical portfolio lives in `sites/mcc-cal-dev/` and deploys as a third Vercel project for `dev.mcc-cal.com`. Software and product work goes there, not on the photography site.
- The companion API/Worker source is not present in this checkout; deploy it from the companion API repository when needed.
- Manifests are generated artifacts; do not hand-edit generated JSON outputs.

## 2) Non-negotiable rules

- Keep new public work in `sites/mcc-cal-vite` unless a legacy widget explicitly needs maintenance.
- Legacy widgets, when maintained, must remain self-contained HTML and should not overwrite older version files.
- Do not edit `dist/**` manually.
- Do not commit secrets, tokens, private keys, or plaintext credentials.
- **Dead files are checked and the check can fail.** `npm run deadcode` runs knip over `sites/mcc-cal-vite` and fails on any source file nothing can reach; it runs inside the existing Lint job so it costs no extra install. Twenty-eight had accumulated before it existed. If a file is reachable only through something knip cannot see, add it to `entry` in `knip.json` with a reason rather than to `ignore`. Unused exports are not gated, deliberately, because there are around a hundred; `npm run deadcode:all` reports them.
- **Accessibility is checked and the check can fail.** `.github/workflows/a11y-axe-firefox.yml` builds the site, serves it, and runs `scripts/a11y/axe-firefox.js` over six representative routes with `@axe-core/playwright`. It exits 1 on any WCAG 2 A/AA violation and 2 when a route cannot be loaded, because not scanning is not the same as finding nothing. Do not add a route to the skip list to make it green; fix the violation or say why it is not one.
- **Pull request titles must be Conventional Commits** (`fix(booking): ...`, `chore: ...`). Merges here are squashes and the repository's squash title default is the PR title, so that title is the subject that lands on `main`. `.github/workflows/pr-conventions.yml` fails a PR whose title is not, and `commitlint.config.js` holds the allowed types.
- **Hooks come from husky**, installed automatically by `npm install` via the `prepare` script. `.husky/pre-commit` runs `lint-staged`; `.husky/commit-msg` runs the attribution check and commitlint. The old `.githooks` directory is gone: it needed each person to run `git config core.hooksPath .githooks` by hand, and nothing on `main` shows evidence it was ever active.
- Do not include AI tool names or attribution in commit messages, co-author lines, PR bodies, issues, or code comments. **This is enforced**, not merely preferred: `.github/workflows/no-ai-attribution.yml` fails any pull request whose commits or text carry a `Co-Authored-By` naming an AI agent, a vendor no-reply address, a "generated with" advertisement, or a robot marker. `.githooks/commit-msg` rejects the same locally. Both run `scripts/ci/check-no-ai-attribution.js`.
- Use standard code annotations: `TODO`, `FIXME`, `BUG`, `SECURITY`, `NOTE`, `A11Y`, etc.
- **This site does not use Tailwind.** It was configured and never ran: `postcss.config.js` loads only autoprefixer, so the directives shipped as literal text into the stylesheet and every utility class did nothing. It has been removed. Style with CSS modules or the existing hand written stylesheets; a class like `mt-8` or `text-sm` will silently have no effect, and a static test now rejects one.
- **A route only exists if it is in `STATIC_PAGE_ROUTES`.** Registering it in `App.tsx` gets it into the bundle but not into the prerender, and Vercel serves 404 for a path with no generated HTML. `/showcase` and `/api-test` sat that way and were removed. Adding a page means both.
- **Changelog entries go in `changelog.d/`, one file per pull request, not in `CHANGELOG.md`.** Everyone editing the top of one file meant any two open PRs conflicted by construction, and each resolution cost a second full round of CI and Vercel builds. Write the `###` heading and bullets only; `scripts/changelog/assemble.js` adds the date and folds the fragments in at release. Run it by hand, never in CI: an automated commit into the deploy root is what produced the doubled production build fixed in #292.
- If adding a code `TODO:`, also track it in `updates/todo.md` (or move to completed tracking when finished).

## 3) Source map (high signal)

- `src/content/blog/` -> canonical blog content (`authors.json`, `posts/<slug>/post.md` preferred, generated `post.json`, `blog-manifest.json`)

- `sites/mcc-cal-vite/` -> public Vite app, routes, components, Vercel Functions, and static assets
- `sites/mcc-cal-admin/` -> internal admin console and admin-only Vercel Functions
- `sites/mcc-cal-dev/` -> technical portfolio; content is a typed schema in `src/content/`, and `github.json` is generated by CI, not hand-edited
- `src/images/Portfolios/` → portfolio images + generated manifests
- `src/content/blog/` -> canonical blog content (`authors.json`, `posts/<slug>/post.md` preferred, generated `post.json`, `blog-manifest.json`)
- `scripts/manifest/` → canonical manifest generators
- `scripts/watchers/` → local auto-regeneration watchers
- `scripts/utils/` → validation/audit utilities
- `docs/standards/` → authoritative coding, performance, accessibility, and workflow standards

## 4) Daily workflow (preferred)

1. Run preflight: `npm run ai:preflight:short`
2. Read the relevant app/API/content file and standards doc before changing behavior
3. Make minimal, scoped edits
4. If image/folder/manifests changed, run generators
5. Validate before handoff

Useful commands:

- `npm run dev`
- `npm run dev:admin`
- `cd sites/mcc-cal-vite && npm run test:run`
- `npm run manifest:dry-run`
- `npm run manifest:generate`
- `npm run repo:health`

## 5) Manifest policy (current)

- Prefer/consume **aggregated manifests** per portfolio (for example: `concert-manifest.json`, `events-manifest.json`, `journalism-manifest.json`, `portrait-manifest.json`, `nature-manifest.json`, `portfolio-manifest.json`).
- Avoid reintroducing per-folder `manifest.json` workflows unless a migration explicitly requires it.
- If schema changes, update generator scripts, app/API consumers, CI/workflows, and docs together.
- **Never write a manifest that differs only by its timestamp.** Every generator goes through `scripts/manifest/write-manifest.js`, which compares against the file on disk with the timestamp fields blanked and writes only when something else changed. Stamping a fresh `generated` on each run made `seo-auto-update.yml` commit into the Vercel root directory after every merge, buying a second full production build for a one line diff, and made `generate-sitemap.js` publish a `<lastmod>` of today, every day.
- **Some galleries are dual-sourced.** The committed manifest holds everything shot before the uploader existed; shoots uploaded through `scripts/cloudflare/add-shoot.js` live in Supabase `portfolio_images` and are merged in at fetch time by `useManifest`. Treat the static manifest as the floor: it alone must always be enough to render, so the Supabase leg is time-bounded and every failure falls back to static-only rather than surfacing an error.
- **Which galleries are dual-sourced is the `SUPABASE_MERGES` table in `useManifest.ts`, not a condition.** Journalism, its `photojournalism` alias, and nature read Supabase today; concert, portraits and events accept uploads but do not read them back yet, so a shoot uploaded for one of those will not appear. Adding a gallery means a source module, an entry in that table, and making its adapter prefer an image's own `url`. See issue #280.
- **A Supabase image carries its own R2 url; never rebuild a path for one.** The `imageUrl.*` helpers construct jsDelivr paths from a folder name, and a Supabase collection has no folder on disk, so building one from its display name 404s. Adapters resolve `image.url ?? imageUrl.<gallery>(...)`. The same applies to covers: only the static pipeline writes thumbnails, so a Supabase collection uses its full image.
- **Page every read of `portfolio_images`.** PostgREST caps a response at its configured maximum, 1000 by default, and reports no error when it does, so an unpaged `select` renders a silently short gallery. Use `fetchPortfolioRows`, which pages with `.range()` and stops on a short page. Events alone holds over 1,600 images.
- **Map `alt_text` to `alt`, not `description`.** Adapters resolve alt as `alt ?? caption ?? description`, so mapped to description it sits behind the caption and a screen reader reads the caption instead of the text written to be the alt.
- R2 object metadata is sent as raw HTTP header values, which reject non-ASCII. Sanitise captions before attaching them to an upload; the full-fidelity text belongs in Supabase, not the header.

## 6) Performance + accessibility doctrine

Optimize for real users first (not synthetic scores):

1. LCP / above-the-fold visibility
2. main-thread blocking avoidance
3. progressive enhancement
4. accessibility and semantic correctness
5. maintainability

Guardrails:

- Do not JS-render critical above-the-fold visuals.
- Prefer native `<img>` for primary images; progressively enhance after first paint.
- Defer non-critical JS.
- Treat performance and accessibility regressions as bugs.
- **Portfolio images belong at 2048px on the long edge, around 250 KB.** That is what Portrait and Concert already are, so it is the house size rather than a target. Bring a folder into line with `node scripts/optimize-images.js <Portfolio> --max-edge=2048`; the flag bounds both orientations, where the default 3840x2160 box limits a portrait frame to 2160 while allowing a landscape 3840.
- **Nothing tracked under `src/images/Portfolios/` may exceed 5 MB**, enforced by `repo-data-integrity.test.ts`. jsDelivr refuses to serve anything over 20 MB and jsDelivr is the CDN for every gallery, so an oversized file is a permanently broken image with no error anywhere. The ceiling is 5 rather than 20 because 20 only catches the file that has already broken.
- `optimize-images.js` calls `withMetadata()`. Keep it: without it, sharp strips the IPTC/XMP copyright and licensing fields that travel with a photograph.

Critical-path budget for `sites/mcc-cal-vite`:

- The app is a client-rendered SPA, so every byte of blocking JS delays first paint. Keep total blocking JS under the 200 KB gzip budget; it currently sits near 174 KB, so there is not much headroom.
- `npm run perf:budget` enforces this against a production build and runs in CI on PRs touching `sites/mcc-cal-vite/**`. Run it locally before proposing bundle-affecting changes.
- Third-party SDKs belong off the critical path. Sentry Session Replay loads through a dynamic import after the `load` event; do not move it back into `Sentry.init`'s `integrations`.
- Prefer named imports over `import * as X` for large SDKs — namespace imports defeat tree-shaking.
- Route components are lazy-loaded. `HomePage` is the deliberate exception because it is the LCP route.

## 7) Widget conventions

- Keep selectors scoped to widget namespace.
- Use semantic versioning filename format: `vX.Y.Z-*.html`.
- Update each widget’s `README.md` and `CHANGELOG.md` when behavior changes.
- For Squarespace deployment, use immutable jsDelivr tag URLs when possible.

## 8) Script organization + archival

- Keep new scripts inside the right subfolder (`manifest/`, `watchers/`, `utils/`, `admin/`).
- Move obsolete scripts to `scripts/_archived/` with clear context.
- Validate script references after reorgs.

## 9) Security baseline

- Use `.env`/environment variables for secrets; keep `.env.example` updated.
- Enforce auth on admin/privileged routes.
- Validate/sanitize untrusted inputs and URLs.
- Prefer production dependency audits (`npm audit --omit=dev`) across root and subprojects.

## 10) Change-management requirements

- If this file changes, add a `CHANGELOG.md` entry under **Docs/Meta**.
- If major structure/workflow changes land, update root `README.md` and relevant standards docs.
- Keep instructions concise; move deep history to changelog/docs, not this file.

## 11) Quick references

- `docs/ONBOARDING.md`
- `docs/standards/workspace-organization.md`
- `docs/standards/widget-reference.md`
- `docs/standards/widget-standards.md`
- `docs/standards/performance-standards.md`
- `docs/standards/accessibility-patterns.md`
- `docs/standards/code-annotations.md`

## Recent updates

- 2026-09-12: Do not commit `sites/mcc-cal-vite/public-vite/images/social/*.jpg` just because a local build changed them. JPEG encoding differs between macOS and the Linux runners for some of them, and `seo-auto-update.yml` commits whatever differs, so a Mac-encoded copy costs an automated commit and a production build after merge. `generate-social-images.js` now regenerates an image only when its inputs change, keyed in `scripts/social-images.inputs.json`; when you change a source photograph or its mapping, run the generator and commit the image and that file together. `socialImages.test.ts` fails when they disagree.
- 2026-09-12: Portfolio image urls come from `repoCdnBase(env)` in `sites/mcc-cal-vite/src/config/repo-cdn.js`: jsDelivr at `@main` in production, and at the deployment's own commit in a Vercel preview, so a pull request that adds photographs shows them. Do not hardcode `McCals-Website@main`. The jsDelivr allowlist in `vercel.json` `images.remotePatterns` stays `@main` only and must equal `OPTIMIZABLE_CDN_PATHNAME` (`repoCdn.test.ts` compares them): `vercel.json` is shared by preview and production, so allowing commit refs would let production's optimizer transform images from any commit. Urls the allowlist refuses are served straight from jsDelivr, which the CSP `img-src` allows, and `imageOptimization.ts` and the prerendered preload both skip the optimizer for them.
- 2026-09-12: A manifest whose shape changes incompatibly gets its version bumped in `MANIFEST_SCHEMA_VERSION` in `sites/mcc-cal-vite/src/components/portfolio/useManifest.ts`, which turns its static url into `/manifests/<file>?v=<n>`. `vercel.json` serves `/manifests/*` with `stale-while-revalidate` of a day, so without a new url a returning browser answers new code with the old document. Keep the number equal to the major `version` the generator writes; `selectedWorkPreload.test.ts` reads the committed manifest and fails when they differ. `generate-route-meta.js` reads `dist/manifests/featured-manifest.json`, the file the page fetches, never `featured-curation.json`, because nothing in the build regenerates the manifest from it.
- 2026-09-12: `/featured-work` is a sequence of individual photographs, not albums. `scripts/manifest/featured-curation.json` is the only input, and the frames it lists are the frames that appear, in that order. `generate-featured-manifest.js` emits `frames[]` carrying per-frame `caption`, `alt`, `width`, `height` and `album`, replacing the old `items[]` of albums, and it fails the build on a curated path that does not resolve, or a date that is not a real day, rather than publishing either. Read `frames`, not `items`.
- 2026-09-12: `src/images/Portfolios/Selected/` holds single photographs staged for `/featured-work`. It is deliberately not a gallery: no route, no album structure, no `tags.json`. `generate-universal-manifest.js` skips it, because `readdir` discovery otherwise invents a sixth portfolio type and `seo-auto-update.yml` then commits that churn after every merge, costing a second production build.
- 2026-09-12: Image widths and `sizes` for `/featured-work` live in `sites/mcc-cal-vite/src/config/selected-work-image.js`, imported by both `FeaturedPortfolio.tsx` and `generate-route-meta.js`, which emits the lead frame's preload. Do not copy the numbers into either file. `selectedWorkPreload.test.ts` fails when the two drift, and `imageWidths.static.test.ts` reads the `_WIDTHS` constants by name and walks `.js` as well as `.ts`.
- 2026-09-12: `sync-manifests.js` does not generate a sitemap, on purpose. The sitemap the app serves is `sites/mcc-cal-vite/public-vite/sitemap.xml` and no script in this repository writes it; `scripts/seo/generate-sitemap.js` writes the repository-root `dist/sitemap.xml`, which nothing serves. Calling it from there printed a successful step while refreshing a file no one reads.
- 2026-09-12: Generated manifests are listed in `.prettierignore`. They are committed from CI, where the pre-commit hook does not run, so formatting them locally puts the committed file permanently at odds with its generator and costs a production build on every later merge.

- 2026-08-08: The performance budget is enforced again. `playwright-performance.yml` runs `perf:budget` on PRs touching `sites/mcc-cal-vite/**`; it had been disabled and aimed at the retired `src/widgets/` paths.
- 2026-08-08: Dependabot is exempt from `require-changelog` and the Copilot Instructions Guardian. Both could only ever fail on bot PRs, which kept the auto-merge queue from draining. Keep the `dependabot[bot]` job-level guards in place when editing those workflows.
- 2026-08-06: Added `sites/mcc-cal-dev` (`dev.mcc-cal.com`) for technical/product work. `/terranova` and `/roadmap` moved off the photography site and now redirect there. Its CSP is `connect-src 'self'`, so repository metadata is fetched by a scheduled workflow and committed as `src/content/github.json` rather than fetched at runtime.
- 2026-08-06: `ci-validate-workflows.js` and `ci-validate-scripts.js` now match the full path of a script reference, including leading directory segments. They previously matched only the `scripts/...` tail and resolved it from the repo root, so an app-relative reference such as `sites/mcc-cal-dev/scripts/sync-github.js` was reported as missing.

- 2026-06-02: CI guard maintenance should keep `actions/github-script@v9` issue calls under `github.rest.issues`, grant `issues: write` to PR-commenting guards, keep Gitleaks checkouts deep enough for commit range scans, and use tracked static manifest fixtures in Vite tests.
- 2026-06-02: Auto-Generate Manifests matrix entries should map to explicit root npm aliases (`manifest:nature`, `manifest:portrait`, `manifest:featured`, `manifest:universal`, etc.) instead of inline generator paths.
- 2026-06-02: Reusable composite actions should parse multiline inputs before shell loops; do not interpolate multiline `files:` blocks directly into `for` statements.

- 2026-03-30: Added a Markdown-first blog workflow under `src/content/blog/`. `post.md` is now the preferred authored source, `post.json` is generated for runtime compatibility, and Google Docs import now writes Markdown to support gradual migration off Docs.

- 2026-03-05: Consolidated this file into a concise operations guide sourced from current standards and READMEs; moved long-form historical detail responsibility to `CHANGELOG.md` and `docs/**`.
