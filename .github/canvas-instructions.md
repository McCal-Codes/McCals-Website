## Canvas instructions — McCal Media wEdit etiquette in Canvas

- Don't modify `dist/**` (build output) or generated `manifest.json` files.
- When changing manifest fields, update: generator(s), CI (if needed), docs, and any consumers (e.g., `src/site/app.js`, relevant widgets).
- For meaningful widget changes, add a new `versions/vN.M.html` file rather than rewriting older versions used in Squarespace.
- **Widget preview workflow**: When testing widgets, let the user preview them in VS Code's built-in browser or locally first, then have the user describe what they see or what issues they encounter rather than automatically hosting on external servers.s workspace

Agent responsibilities

- **Always read these instructions first** when starting any session in this workspace
- **Update these instructions** if you discover new patterns, workflows, or critical information that would help future agents
- **Add entries to Recent updates** section when you make significant changes to document what was learned or improved

Scope and intent

- Use Canvas to edit small, focused changes to widgets (`src/widgets/**`) and scripts (`scripts/**`). The Squarespace site embeds versioned widget HTML; `src/site/` is a local test harness only.

Where to work

- Widgets: `src/widgets/<widget>/versions/vN.M.html` (self‑contained HTML with inline CSS/JS)
- Manifests & scripts: `scripts/*.js` (Node 16+; cross‑platform)
- Test harness: `src/site/` (preview only; don’t couple widgets to it)
- Images: `src/images/Portfolios/**` (manifests are generated from this tree)

Core workflows (Canvas-friendly)

- Update a widget: edit the latest `versions/vN.M.html`; if behavior changes, bump minor version (e.g., v1.0 → v1.1) and keep old file.
- Generate manifests when images change: prefer `scripts/enhanced-manifest-generator.js` (auto mode). Do not hand-edit generated `manifest.json`.
- Keep selectors and data attributes stable for Squarespace; avoid external fonts and heavy dependencies. Inline CSS/JS only.

Manifests essentials

- Folder structure (Concerts): `src/images/Portfolios/Concert/<Band>/<Month Year>/*.jpg`
- Generator: `scripts/enhanced-manifest-generator.js` parses dates from filenames (YYMMDD/YYYMMDD/DD-MM-YY edge) or EXIF; writes per‑folder `manifest.json` and a concert `processing-summary.json`.
- Key outputs:
  - Per-folder: `src/images/Portfolios/Concert/<Band>/<Month Year>/manifest.json`
  - Rollups: `.../Concert/concert-manifest.json`, `.../Events/events-manifest.json`, `.../Journalism/journalism-manifest.json`, `src/images/Portfolios/portfolio-manifest.json`

CI and automation

- GitHub Actions regenerate and commit manifests on pushes to `src/images/Portfolios/**` for Concert, Events, Journalism.
- PR guard: `.github/workflows/copilot-instructions-guardian.yml` reminds to keep AI instructions and changelog updated.

Edit etiquette in Canvas

- Don’t modify `dist/**` (build output) or generated `manifest.json` files.
- When changing manifest fields, update: generator(s), CI (if needed), docs, and any consumers (e.g., `src/site/app.js`, relevant widgets).
- For meaningful widget changes, add a new `versions/vN.M.html` file rather than rewriting older versions used in Squarespace.

Quick references

- `scripts/enhanced-manifest-generator.js` — manifest shape/logic
- `scripts/watch-auto-manifest.js` — recommended dev loop
- `src/site/app.js` — example consumer of folder manifests (`images[]`, `totalImages`, `concertDate.*`)
- `docs/README.md` — repo overview; widget READMEs under `src/widgets/**`

Windows tip

- Use `scripts/win-generate-universal-manifest.ps1` to run the universal manifest generator on Windows environments.

Recent updates

- 2025-10-24T22:21:24.273Z — Successfully implemented podcast widget v1.9.5 with auto-hydrating RSS episodes. Added Ep 9 fallback data, live RSS caching, and updated show branding. Created test page that works properly. Widget now auto-populates new episodes without manual updates.
- 2025-10-09T17:15:26.710Z — Close Button Optimization and Navigation Hiding pattern implemented
- 2025-10-06T23:41:05.929Z — Session complete: minor updates.
- 2025-10-06T23:40:47.794Z — Created comprehensive SEO starter guide document tailored for McCal Media's Squarespace implementation, covering site structure, titles/meta descriptions, image optimization, structured data, internal linking, and technical hygiene. Added to docs/standards/ and updated main README and CHANGELOG.
- 2025-10-06T21:59:34.422Z — Fixed concert portfolio widget v4.6 image loading and layout issues. Updated CSS to use responsive column-width layout with overlay info styling, matching journalism widget patterns. Images now load properly in masonry-style grid with smooth transitions and loading animations.
- 2025-10-06T21:54:49.567Z — Created performance-optimized concert portfolio widget v4.6 with critical CSS inlining, modern JavaScript patterns, and reduced main-thread blocking. Addresses PageSpeed issues: render blocking resources, unused CSS/JS, and long tasks.
- 2025-10-06T21:54:42.902Z — Created performance-optimized concert portfolio widget v4.6 with critical CSS inlining, modern JavaScript patterns, and reduced main-thread blocking. Addresses PageSpeed issues: render blocking resources, unused CSS/JS, and long tasks. Added resource hints and lazy-loaded features.
- 2025-10-06T21:42:37.717Z — Fixed structured data detection issues in concert portfolio widget v4.5. Updated addBasicStructuredData function to properly calculate total images from manifest bands, generate absolute image URLs, and add comprehensive metadata. Added debug functionality to check structured data locally. Structured data now includes proper Schema.org ImageGallery markup with image URLs, author info, and SEO metadata.
- 2025-10-06T21:37:13.768Z — Successfully implemented SEO enhancements for concert portfolio widget v4.5 including structured data, enhanced alt text generation, and accessibility improvements. Images are now loading properly and SEO features are working.
- 2025-10-06T21:19:20.740Z — Session complete: minor updates.
- 2025-10-06T21:19:09.070Z — Successfully tested and fixed VS Code tasks for Copilot AI workflow. Fixed PowerShell quoting issues in widget validation task, created proper Node.js validation script, and verified all core tasks work correctly.
- 2025-10-06T21:13:03.276Z — Session complete: minor updates.
- 2025-10-05T07:48:39.394Z — Updated test widgets to latest versions - journalism widget updated from v3.0 to v4.9 with latest features
- 2025-10-04T00:00:00.002Z — Added agent responsibilities and widget preview workflow guidance: agents must read/update instructions and use user-driven preview workflow instead of external hosting
- 2025-10-03T09:15:17.087Z — Featured Portfolio Widget v1.5 complete: Enhanced journalism titles, ultra-minimal scrollbars (4px, 0.15 opacity), improved masonry spacing (16px gaps), randomized cover images with Fisher-Yates shuffle, minimal gray accents (#888888), production-ready deployment with 15-item limit, scrollable lightbox, and comprehensive changelog documentation
- 2025-10-03T09:15:11.679Z — Session complete: minor updates.
- 2025-10-03T07:08:00.405Z — Fixed featured portfolio widget by creating generate-featured-manifest.js script and updated widget to v1.2 with better debugging
- Entries below are appended by the AI finalize script to record what the last agent session changed.
- 2025-10-03T06:29:14.362Z — Validation: preflight/guardian/canvas/codex added and tasks wired
- Entries below are appended by the AI finalize script to summarize the last Canvas/agent session changes.
