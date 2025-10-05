## Copilot instructions for McCal Media widgets workspace

Purpose and scope

- This repo is a development workspace for Squarespace widgets. The Squarespace site embeds versioned widget HTML from `src/widgets/**`. The `src/site/` app is a local test harness only; production is Squarespace.
- Architecture: Photo assets  manifest generation  self-contained HTML widgets  Squarespace Code Blocks

Agent responsibilities

- **Always read these instructions first** when starting any session in this workspace
- **Update these instructions** if you discover new patterns, workflows, or critical information that would help future agents
- **Add entries to Recent updates** section when you make significant changes to document what was learned or improved
- **Update main README.md** when making major structural changes (new widgets, reorganization, workflow changes) - keep the "Recent Updates" section current

Source layout you'll use most

- `src/widgets/`  primary deliverables (selfcontained HTML widgets with inline CSS/JS). Each widget has its own README and versioned files.
- `src/images/`  portfolio assets consumed by widgets and local test site.
- `src/site/`  local demo app (`index.html`, `app.js`, `styles.css`) to preview data flows and layouts.
- `scripts/`  Node scripts for organizing photos and generating manifests.
- `dist/`  build output (generated). Do not edit by hand.

Before large changes

- Run preflight validation: `npm run ai:preflight:short` or VS Code task "AI: Preflight (short)" to validate context awareness.
- Read widget-specific READMEs before modifying widgets: `src/widgets/*/README.md` contain embedding instructions and performance notes.

Run/build/deploy workflows

- Node >= 16. Install once with `npm install`.
- Local dev server: `npm run dev` (serves `src/site/` via `dev-server.js` on http://localhost:3000; opens browser). Production-like: `npm run serve`.
- Build static site: `npm run build` (copies `src/site/` and `src/images/` to `dist/`).
- Optional test-site deploys: `npm run deploy` (interactive) or `deploy:netlify|vercel|surge`. The real production site is Squarespace.
- Watchers (auto-regenerate): `npm run watch:auto-manifest` (Concerts), `npm run watch:events-manifest`, `npm run watch:journalism-manifest`, `npm run watch:universal`.

Platform tip (Windows)

- Helper: `scripts/win-generate-universal-manifest.ps1` can run the universal manifest generator on Windows.

Images and manifests pipeline (critical)

- Required structure (Concerts): `src/images/Portfolios/Concert/<Band Name>/<Month Year>/*.jpg` (spaces allowed).
- Generate manifests: `npm run manifest:generate` (auto mode), or per-type: `manifest:concert`, `manifest:events`, `manifest:journalism`, `manifest:universal`.
- Watch for changes (auto-regenerate): `npm run watch:auto-manifest` (logs to `logs/auto-manifest.log`).
- Generator details: `scripts/enhanced-manifest-generator.js` extracts dates from filenames (YYMMDD, YYYYMMDD, some DD-MM-YY cases like `13-01-24`  2024-12-13) or EXIF (`DateTime`, `DateTimeOriginal`). Writes `manifest.json` in each date folder and `processing-summary.json` at Concert root.
- Do not hand-edit generated `manifest.json` files; change images/folders and re-run generators instead. Use `npm run manifest:cleanup` if you reorganize bands.

Key manifest outputs

- Per-folder (Concert): `src/images/Portfolios/Concert/<Band>/<Month Year>/manifest.json`
- Concert rollup: `src/images/Portfolios/Concert/concert-manifest.json`
- Events rollup: `src/images/Portfolios/Events/events-manifest.json`
- Journalism rollup: `src/images/Portfolios/Journalism/journalism-manifest.json`
- Universal rollup: `src/images/Portfolios/portfolio-manifest.json`
- Summary: `src/images/Portfolios/Concert/processing-summary.json`

CI automation

- `.github/workflows/build-manifest.yml` runs on pushes touching `images/Portfolios/Concert/**` and regenerates/commits concert manifests (uses Node 20). It commits `images/Portfolios/Concert/concert-manifest.json` and per-folder `manifest.json` when changed.
- Similar jobs exist for Events and Journalism: `events-manifest.yml` and `journalism-manifest.yml` watch `src/images/Portfolios/{Events|Journalism}/**` and commit their respective `*-manifest.json` outputs.
- Docs guard: `copilot-instructions-guardian.yml` reminds/fails PRs when core flows change without updating `.github/copilot-instructions.md`, and requires a `CHANGELOG.md` entry when the instructions change (bypass labels: `docs-acknowledged`, `skip-copilot-instructions`).

Widget authoring conventions

- Widgets are drop-in HTML for Squarespace Code Blocks: inline CSS, minimal JS, no external fonts; prefer self-contained assets. See `src/widgets/**/README.md` for usage.
- Self-contained architecture: Each widget HTML file contains all CSS/JS inline to avoid external dependencies in Squarespace.
- Versioning: keep versioned HTML files (e.g., `versions/v2.5.3-event-portfolio.html`) and update per-widget CHANGELOGs if present; repo-level policy is in `docs/standards/versioning.md`.
- Don't couple widgets to the local test site; widgets read from manifests and/or remote assets. Keep selectors/namespaces stable for Squarespace.
- Performance patterns: Use CSS columns for masonry layouts, intersection observers for progressive loading, and intelligent caching for GitHub API calls.
- Configuration via data attributes: Widgets use `data-panes`, `data-category` etc. for Squarespace customization without code changes.

Widget status workflow

- **Production ready**: If widget works properly → add to "Available Widgets" in main README
- **Work in progress**: If widget needs work → create `STATUS.md` file, add to "Work in Progress" section  
- **Archive unused**: Move complete directory to `src/widgets/_archived/` if no longer needed
- **Status guide**: See `src/widgets/WIDGET-STATUS-GUIDE.md` for complete workflow and criteria

Local test site patterns (for previews only)

- `src/site/app.js` is a vanilla JS SPA demo that reads manifests (example: Funky Lamp folder `manifest.json`, expects fields like `images[]`, `totalImages`, optional `concertDate.{year,month,day,iso}`). If you change manifest shapes, update generators and this app together.

Integration points and external deps

- Scripts use Node fs/path and `exif-parser` to read EXIF; avoid shell-specific assumptions (works on Windows/macOS/Linux). Optional CLIs for deploys: `netlify-cli`, `vercel`, `surge`.

Safe-change checklist for agents

- Add/modify images under `src/images/**`; never commit edits to `dist/**`.
- Run manifests before testing: `npm run manifest:generate` or start the watcher.
- Keep widget code self-contained; don't import from the test app.
- Preserve folder naming (Band/Month Year) and filename date patterns when possiblegenerators rely on them.
- If adding scripts, follow existing patterns (`scripts/*.js`, crossplatform Node only). If changing manifest fields, update: generator, CI, docs, and any consumers in `src/site/` and widgets that read them.
- Widget versioning: Create new version files in `src/widgets/[name]/versions/` rather than editing existing versions.
- Test locally: Use `npm run dev` to preview widgets in test harness before Squarespace deployment.
- **Widget preview workflow**: When testing widgets, let the user preview them in VS Code's built-in browser or locally first, then have the user describe what they see or what issues they encounter rather than automatically hosting on external servers.
- Performance: Monitor widget performance with `?debug=true` URL parameter and `window.portfolioAPI.getMetrics()` in console.

Widget performance and debugging

- Debug mode: Add `?debug=true` to any widget URL to enable performance overlays and metrics
- Console access: Use `window.portfolioAPI.getMetrics()` in browser console for cache hit rates and API performance
- Lightbox patterns: Widgets use fixed positioning with z-index 2147483647, hidden scrollbars, and pointer-events blocking
- Error resilience: Widgets implement exponential backoff, graceful degradation, and "Coming Soon" fallback cards
- CSS patterns: Masonry layouts use CSS columns with `break-inside: avoid`, progressive loading with intersection observers

Good starting references

- `scripts/enhanced-manifest-generator.js`  manifest schema and date logic.
- `scripts/watch-auto-manifest.js`  recommended dev loop.
- `src/widgets/**/README.md`  embedding instructions and constraints.
- `src/site/app.js`  example data flow from manifests to UI.
- `docs/standards/widget-reference.md` ⭐ **START HERE**: quick reference for widget development patterns.
- `docs/standards/widget-standards.md`  comprehensive widget standards and architecture guide.
- `docs/standards/widget-enhancements.md`  proven improvement patterns for widget optimization.
- `docs/standards/widget-development.md`  comprehensive guide for applying enhancement patterns systematically.

Change management

- When you update this file, add a brief entry to `CHANGELOG.md` under Docs/Meta noting what changed. A PR check will remind/fail if missing.

Recent updates

- **NEXT SESSION PRIORITY**: Update portfolio widgets (concert, event, featured) to align with journalism widget v4.9 patterns: fixed lightbox image stretching (`object-fit: contain`, `display: block`, `margin: 0 auto`), hidden scrollbars for immersive experience, enhanced navigation hiding in lightbox mode, improved filtering without gaps, minimal badges with backdrop blur, comprehensive debug tools. Apply patterns from `docs/standards/widget-enhancements.md` systematically.
- 2025-10-05T07:48:39.389Z — Updated test widgets to latest versions - journalism widget updated from v3.0 to v4.9 with latest features
- 2025-10-05T12:30:00.000Z  Admin Portfolio Importer v1.1.0 complete: Created secure admin-only widget for importing and organizing portfolio images with backend API integration. Features authentication, smart folder detection, preview system, and automatic manifest generation. Includes comprehensive documentation (README, CHANGELOG) and production-ready status. Backend server handles file uploads, date extraction, and folder organization following workspace conventions.
- 2025-10-05T12:00:00.000Z  Photojournalism widget v4.9 lightbox fix: Fixed image stretching in lightbox gallery by adding `object-fit: contain`, `display: block`, and `margin: 0 auto` to preserve aspect ratios and prevent distortion. Images now maintain proper proportions regardless of viewport size. Follows same pattern as event portfolio widget for consistency across widget family.
- 2025-10-05T06:15:00.000Z  Widget standardization documentation complete: Created comprehensive `widget-standards.md` establishing consistent patterns across all widget types (portfolio, navigation, content, hero). Added `widget-reference.md` as quick development checklist. Documented architecture standards, CSS patterns, performance guidelines, accessibility requirements, and debug patterns. Simplified all file names from UPPER-CASE-NAMES.md to lowercase-names.md for better organization. Updated docs organization and copilot instructions to reference new standardization guides.
- 2025-10-05T06:00:00.000Z  Widget enhancement framework complete: Created comprehensive `widget-development.md` providing systematic methodology for applying proven patterns across all widgets. Updated photojournalism README with enhancement pattern references. Established quality assurance standards, implementation checklists, and continuous improvement processes. All workspace rules validated and documentation aligned.
- 2025-10-05T01:45:00.000Z  Photojournalism widget optimization complete (v4.4→v4.8): Fixed Published Work filter functionality, enhanced filtering UX (no gaps), minimal status indicators, comprehensive navigation hiding in lightbox, hidden scrollbars for immersive experience. Created comprehensive widget enhancement patterns documentation (`docs/standards/widget-enhancements.md`) cataloging proven improvements for systematic application across all widgets.
- 2025-10-05T00:30:00.000Z  Footer widget v1.2.0 compliance: Removed modal functionality for simplified UX, updated README and CHANGELOG documentation, added to main README Available Widgets list. Widget now fully compliant with workspace standards including accessibility, performance patterns, and self-contained architecture.
- 2025-10-05T00:00:00.000Z  Widget optimization updates: Enhanced site-navigation v1.6.3 with improved blur effects, hover states, and performance optimizations. Created site-footer v1.2.0 with CSS custom properties, enhanced accessibility, mobile optimizations, and comprehensive compliance with workspace standards.
- 2025-10-04T11:30:00.000Z  Widget status organization: Archived GitHub portfolio to src/widgets/_archived/, marked blog feed and nature portfolio as work-in-progress with STATUS.md files. Updated README to show 7 production widgets + 2 WIP. Created archival system for widget management.
- 2025-10-04T11:26:00.000Z  Updated main README.md to v2.4.0: Added comprehensive repository organization details, expanded widget list, organized documentation structure, AI development support, and maintenance guidelines. Added agent responsibility to keep README current with major changes.
- 2025-10-04T11:22:00.000Z  Documentation organization complete: Reorganized docs into categories (workflows/, automation/, integrations/, standards/, archive/) and test files into organized structure (tests/html/). Updated all references and paths.
- 2025-10-04T11:19:00.000Z  Repository organization complete: Moved 15+ test files from root to organized tests/html/ structure, relocated deployment scripts to scripts/, cleaned up temporary files. Root directory now clean and professional.
- 2025-10-04T00:00:00.000Z  Enhanced copilot instructions with architecture overview, performance patterns, widget authoring conventions, and comprehensive development workflow guidance
- 2025-10-04T00:00:00.001Z  Added agent responsibilities and widget preview workflow guidance: agents must read/update instructions and use user-driven preview workflow instead of external hosting
- 2025-10-03T09:15:17.082Z  Featured Portfolio Widget v1.5 complete: Enhanced journalism titles, ultra-minimal scrollbars (4px, 0.15 opacity), improved masonry spacing (16px gaps), randomized cover images with Fisher-Yates shuffle, minimal gray accents (#888888), production-ready deployment with 15-item limit, scrollable lightbox, and comprehensive changelog documentation
- 2025-10-03T09:15:11.674Z  Session complete: minor updates.
- 2025-10-03T07:08:00.400Z  Fixed featured portfolio widget by creating generate-featured-manifest.js script and updated widget to v1.2 with better debugging
- 2025-10-03T06:29:14.357Z  Validation: preflight/guardian/canvas/codex added and tasks wired
- Entries below are appended by the AI finalize script to record what the last agent session changed.
