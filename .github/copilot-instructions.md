## TODO Tree Extension Compatibility (2025-10-09)


All TODO/task files (including markdown in `docs/todo/`, code comments, and Copilot writeups) must use standard tags like `TODO`, `FIXME`, `BUG`, etc., and/or markdown checklists (`- [ ]`, `- [x]`) for compatibility with the VS Code Todo Tree extension.

Copilot may add `TODO:` or `FIXME:` tags in any writeup, code, or documentation to indicate next steps, unresolved issues, or bugs.

- Use `TODO:` or `FIXME:` at the start of a line or after a comment marker in code or markdown.
- For markdown, use checklist items (`- [ ]` for incomplete, `- [x]` for complete) to have them appear in the tree.
- You can add custom tags (e.g., `WDGTBUG`, `REFACTOR`, etc.) to the tree by adding them to the extension's tag list in your VS Code settings (see `todo-tree.general.tags`).
- The extension will automatically show these in the tree view, let you jump to them, and highlight them in the editor.
- See the extension wiki for advanced configuration (color, icon, grouping, etc.).

**Example:**
```markdown
# Widget TODOs
- [ ] TODO: Refactor widget loader
- [ ] FIXME: Fix lightbox bug
```

Agents must follow these conventions for all new and updated todo/task files to ensure discoverability and navigation in VS Code. When using custom tags, document them in your workspace or extension settings for clarity.

**Special note for `updates/todo.md`:**
- Only use explicit `TODO:` tags for changelog/code-related checklist items or those that must appear in the Todo Tree for code tracking.
- General checklist items should not use `TODO:` tags unless they are important for code or changelog tracking.
- For older or less-recent checklist items that should not appear in the Todo Tree, use an `IGNORE` or similar tag (and add it to your VS Code Todo Tree ignore list if needed).
- If you add a `TODO:` in code (e.g., in a widget or script), you must also add a matching entry in `updates/todo.md` or, if completed, move it to a `done.md` or `finished.md` document for traceability.
- This keeps the Todo Tree focused and avoids clutter from generic planning items, while ensuring all actionable TODOs are tracked and discoverable.
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

- `.github/workflows/build-manifest.yml` runs on pushes touching `src/images/Portfolios/Concert/**` and regenerates/commits concert manifests (uses Node 20). Features retry logic, JSON validation, and robust error handling.
- Similar jobs exist for Events and Journalism: `events-manifest.yml` and `journalism-manifest.yml` watch `src/images/Portfolios/{Events|Journalism}/**` with full error recovery.
- Emergency recovery: `regenerate-all-manifests.yml` can manually regenerate any combination of manifests with force option.
- Health monitoring: `workflow-health-check.yml` runs daily to validate all manifest files and generation scripts.
- All workflows include: retry logic (3 attempts), JSON validation, data integrity checks, proper error reporting.
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

Workflow troubleshooting

- **Manifest generation fails**: Use GitHub Actions "Regenerate All Manifests" workflow with force option to recover
- **Path errors**: All manifest workflows expect `src/images/Portfolios/` structure (not `images/Portfolios/`)
- **JSON validation fails**: Workflows include automatic JSON validation with jq; invalid JSON will fail with clear error messages
- **Retry failures**: Workflows attempt generation 3 times with 5-second delays; persistent failures indicate script or data issues
- **Manual recovery**: Access Actions tab → "Regenerate All Manifests" → "Run workflow" to force regeneration of specific manifests
- **Health monitoring**: Check "Workflow Health Check" results for daily validation of all manifest files and scripts

Widget performance and debugging

- **Performance Standards**: All widgets must follow `docs/standards/performance-standards.md` for Lighthouse optimization. Use Concert Portfolio v4.6 as the primary performance reference implementation.
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
- `docs/standards/widget-standards.md` and `docs/standards/widget-development.md`  proven improvement patterns and systematic methodology for widget optimization.
- `docs/standards/widget-development.md`  comprehensive guide for applying enhancement patterns systematically.
- `docs/standards/performance-standards.md` ⭐ **PERFORMANCE REFERENCE**: Lighthouse optimization standards using Concert Portfolio v4.6 as case study.
- `docs/standards/image-seo-standards.md`  comprehensive guide for optimizing portfolio images for search engines and accessibility.

Change management

- When you update this file, add a brief entry to `CHANGELOG.md` under Docs/Meta noting what changed. A PR check will remind/fail if missing.


Scripts folder organization and archival (2025-10-06)

- All scripts must be organized by function: `manifest/` for manifest generators, `watchers/` for watchers, `utils/` for utilities, `admin/` for admin/import tools. Do not place new scripts directly in the root `scripts/` folder.
- Any script not referenced by npm scripts, not used by widgets, or not part of the active automation pipeline should be moved to `scripts/_archived/`.
- When archiving, move the file and add a comment/header indicating it is not actively used.
- Before adding new scripts, check for existing patterns and update the relevant README in each subfolder.
- After any reorganization, validate all npm scripts and workflows to ensure nothing is broken.
- Document all changes in this instruction file and in the main `CHANGELOG.md` under Docs/Meta.
- Periodically review the scripts folder for unused or obsolete files and archive as needed.
- Always keep the scripts folder clean and efficient to avoid confusion and ensure maintainability.

Recent updates

- 2025-10-24T23:14:01.897Z — Successfully created Portrait Portfolio v1.0 widget - portrait photography showcase with vertical composition focus, 3:4 aspect ratios, enhanced detail viewing, performance optimizations, and SEO features. Added to available widgets list and created sample manifest.
- 2025-10-24T22:21:24.272Z — Successfully implemented podcast widget v1.9.5 with auto-hydrating RSS episodes. Added Ep 9 fallback data, live RSS caching, and updated show branding. Created test page that works properly. Widget now auto-populates new episodes without manual updates.
- 2025-10-09T17:15:26.708Z — Close Button Optimization and Navigation Hiding pattern implemented
- 2025-10-09T17:30:00.000Z — Photojournalism Portfolio Widget v5.2 complete: Glass-like filter buttons with backdrop blur, Fisher-Yates shuffle with one image per album, adjacency minimization, excluded Events folder/Rooney events, simplified All/Published filters, muted green Published accent, updated subheading for political work focus. Added comprehensive changelog entries to both widget CHANGELOG.md and internal modal. All changes validated and production-ready.
- 2025-10-08T10:00:00.000Z — About page widget v1.4.4 updated: Refreshed bio to reflect alumni status from Point Park, freelance photographer/photojournalist work, Globe photo editor role over last fall, client work extending into summer, and Kentucky project collaboration. Enhanced contact options with clean dropdown menu offering email and Calendly coffee chat booking. Removed non-functional blog button, updated portfolio link to /featured-work. Improved contact UX with elegant slide-down menu and proper Calendly integration.
- 2025-10-06T23:41:05.924Z — Session complete: minor updates.
- 2025-10-06T23:40:47.789Z — Created comprehensive SEO starter guide document tailored for McCal Media's Squarespace implementation, covering site structure, titles/meta descriptions, image optimization, structured data, internal linking, and technical hygiene. Added to docs/standards/ and updated main README and CHANGELOG.
- 2025-10-06T22:05:00.000Z — Updated copilot instructions to reference new performance standards document and establish Concert Portfolio v4.6 as the primary performance reference implementation for all widgets. Added performance standards to good starting references with priority star rating.
- 2025-10-06T21:59:34.417Z — Fixed concert portfolio widget v4.6 image loading and layout issues. Updated CSS to use responsive column-width layout with overlay info styling, matching journalism widget patterns. Images now load properly in masonry-style grid with smooth transitions and loading animations.
- 2025-10-06T21:54:49.562Z — Created performance-optimized concert portfolio widget v4.6 with critical CSS inlining, modern JavaScript patterns, and reduced main-thread blocking. Addresses PageSpeed issues: render blocking resources, unused CSS/JS, and long tasks.
- 2025-10-06T22:00:00.000Z — Repository cleanup: Removed entire `tests/` directory containing obsolete test files, debug artifacts, and site workspace backups. Repository structure simplified and professionalized. All test files archived and committed for record-keeping.
- 2025-10-06T21:42:37.712Z — Fixed structured data detection issues in concert portfolio widget v4.5. Updated addBasicStructuredData function to properly calculate total images from manifest bands, generate absolute image URLs, and add comprehensive metadata. Added debug functionality to check structured data locally. Structured data now includes proper Schema.org ImageGallery markup with image URLs, author info, and SEO metadata.
- 2025-10-06T21:37:13.763Z — Successfully implemented SEO enhancements for concert portfolio widget v4.5 including structured data, enhanced alt text generation, and accessibility improvements. Images are now loading properly and SEO features are working.
- 2025-10-06T21:30:00.000Z — Created `docs/standards/image-seo-standards.md` documenting comprehensive SEO best practices for portfolio images including alt text, file naming, structured data, lazy loading, and accessibility standards for improved search engine optimization and user experience.
- 2025-10-06T21:19:20.735Z — Session complete: minor updates.
- 2025-10-06T21:19:09.064Z — Successfully tested and fixed VS Code tasks for Copilot AI workflow. Fixed PowerShell quoting issues in widget validation task, created proper Node.js validation script, and verified all core tasks work correctly.
- 2025-10-06T21:13:03.271Z — Session complete: minor updates.
- 2025-10-05T16:00:00.000Z  **CRITICAL LESSON LEARNED**: Event portfolio widget debugging session revealed critical pattern - widget lightbox system is extremely fragile. v2.6.0 works perfectly, but v2.6.1, v2.6.2, and v2.6.3 all broke when trying to "upgrade" functionality. **Key insight**: NEVER mix incompatible patterns. Always copy complete working systems (CSS+HTML+JS together) or build from stable foundation. Created `docs/standards/WIDGET-DEBUGGING-LESSONS.md` with emergency recovery protocol. **Latest stable**: v2.6.0 (perfect), v2.6.2 (has changelog but lightbox issues). Future agents must read debugging lessons before widget modifications.
- 2025-10-05T15:00:00.000Z  Event Portfolio v2.6.0 enhancement complete: Applied journalism widget v4.9 patterns to event portfolio. Fixed lightbox image stretching (`object-fit: contain`, `display: block`, `margin: 0 auto`), added hidden scrollbars for immersive experience, enhanced navigation hiding with comprehensive selectors, improved close button with fixed positioning and accessibility, integrated version indicator in heading, comprehensive debug panel with detailed metrics and controls. All v2.5.6 optimizations retained. Remaining widget (featured) still needs similar enhancements.
- 2025-10-05T14:00:00.000Z  Concert Portfolio v4.4 enhancement complete: Applied journalism widget v4.9 patterns to concert portfolio. Fixed lightbox image stretching (`object-fit: contain`, `display: block`, `margin: 0 auto`), added hidden scrollbars for immersive experience, enhanced navigation hiding with comprehensive selectors, improved close button with fixed positioning and accessibility, integrated version indicator in heading, comprehensive debug panel with detailed metrics and controls. All v4.3 optimizations retained.
- 2025-10-05T13:00:00.000Z  Manifest workflow reliability complete: Enhanced all manifest workflows (concert, events, journalism) with comprehensive auto/manual operation support. Added backup/restore system, widget compatibility validation, retry logic (3 attempts), JSON validation with jq, rollback on failure, concurrency protection. Created emergency recovery workflow (`regenerate-all-manifests.yml`) and daily health monitoring (`workflow-health-check.yml`). All workflows now include proper error reporting, data integrity checks, and widget protection mechanisms. Verified working: events manifest (4 events, 84 images), concert manifest (16 bands, 211 images), all generation scripts functional. GitHub Actions workflows now bulletproof and never break existing widgets.
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
- 2025-10-03T09:15:17.082Z  Featured Portfolio Widget v1.5 complete: Enhanced journalism titles, ultra-minimal scrollbars (4px, 0.15 opacity), improved masonry spacing (16px gaps), randomized cover images with Fisher-Yates shuffle, minimal gray accents (color 888888), production-ready deployment with 15-item limit, scrollable lightbox, and comprehensive changelog documentation
- 2025-10-03T09:15:11.674Z  Session complete: minor updates.
- 2025-10-03T07:08:00.400Z  Fixed featured portfolio widget by creating generate-featured-manifest.js script and updated widget to v1.2 with better debugging
- 2025-10-03T06:29:14.357Z  Validation: preflight/guardian/canvas/codex added and tasks wired
- Entries below are appended by the AI finalize script to record what the last agent session changed.
**Start Here:** For workspace/process standards, scripts organization, and validation checklists, see [docs/standards/workspace-organization.md](../docs/standards/workspace-organization.md).
