## Codex instructions — efficient usage in VS Code (rate‑limit friendly)

Agent responsibilities

- **Always read these instructions first** when starting any session in this workspace
- **Update these instructions** if you discover new patterns, workflows, or critical information that would help future agents
- **Add entries to Recent updates** section when you make significant changes to document what was learned or improved

Goal

- Minimize calls while preserving accuracy. Prefer small, surgical edits and single-pass diffs. Avoid exploratory multi-turns when the repo already encodes the answer.

When to ask vs. act

- Act directly if the file and pattern are clear (e.g., bump widget minor version, tweak CSS vars).
- Ask once for essentials only when truly blocking (ambiguous target widget, missing manifest fields, external secrets).

Pre-call checklist (30–60 seconds)

- Locate the definitive source:
  - Widgets: `src/widgets/<widget>/versions/`
  - Manifests/scripts: `scripts/*.js` (enhanced generator, watchers)
  - CI: `.github/workflows/*.yml`
  - Test harness: `src/site/app.js`
- Confirm generated vs. authored files. Never edit `dist/**` or generated `manifest.json`.
- Scan `package.json` scripts for the exact command to wire into edits.

Single-pass edit strategy

- Draft the minimal diff with context comments instead of restating the whole file.
- For widgets: create a new `versions/vN.M.html` (don’t overwrite older versions). Copy only what’s needed; keep CSS/JS inline.
- For manifest schema changes: update generator(s) first, then consumers (`src/site/app.js`, widgets), then CI.
- When touching shared data (manifests, loaders, or image folders), re-load the production widget version to confirm regressions were not introduced before handing off.

Batch related changes

- Group 2–5 complementary edits in one call (e.g., new widget version + README note + small CSS fix).
- Avoid splitting into multiple agent calls unless there’s real uncertainty.

Prefer repo conventions

- Follow existing class names, data attributes, and naming. Use existing helpers: `enhanced-manifest-generator.js`, `watch-auto-manifest.js`.
- Keep platform-neutral Node (no shell-only assumptions). Inline assets for widgets; no external fonts.

Validate cheaply

- Sanity-check diffs compile: basic syntax, correct paths, and consistent version increments.
- If needed, run the minimal local check: build copies `src/site` and `src/images` → `dist/`; server at http://localhost:3000.
- **Widget preview workflow**: When testing widgets, let the user preview them in VS Code's built-in browser or locally first, then have the user describe what they see or what issues they encounter rather than automatically hosting on external servers.

Avoids

- Broad repo rewrites, large refactors without clear need, or speculative test generation.
- Multi-round clarifications for choices that repo conventions already decide.

PR/Docs discipline

- If core flows change or instructions are impacted, update `.github/copilot-instructions.md` and `.github/canvas-instructions.md` and add a brief `CHANGELOG.md` entry (Docs/Meta). The PR guard will remind you.

Recent updates

- 2025-11-03T16:39:33.008Z — Completed workflow validation system and portrait portfolio automation. Added comprehensive health checks and updated standards documentation.
- 2025-10-24T23:14:01.899Z — Successfully created Portrait Portfolio v1.0 widget - portrait photography showcase with vertical composition focus, 3:4 aspect ratios, enhanced detail viewing, performance optimizations, and SEO features. Added to available widgets list and created sample manifest.
- 2025-10-24T22:21:24.274Z — Successfully implemented podcast widget v1.9.5 with auto-hydrating RSS episodes. Added Ep 9 fallback data, live RSS caching, and updated show branding. Created test page that works properly. Widget now auto-populates new episodes without manual updates.
- 2025-10-09T17:15:26.710Z — Close Button Optimization and Navigation Hiding pattern implemented
- 2025-10-06T23:41:05.929Z — Session complete: minor updates.
- 2025-10-06T23:40:47.795Z — Created comprehensive SEO starter guide document tailored for McCal Media's Squarespace implementation, covering site structure, titles/meta descriptions, image optimization, structured data, internal linking, and technical hygiene. Added to docs/standards/ and updated main README and CHANGELOG.
- 2025-10-06T21:59:34.422Z — Fixed concert portfolio widget v4.6 image loading and layout issues. Updated CSS to use responsive column-width layout with overlay info styling, matching journalism widget patterns. Images now load properly in masonry-style grid with smooth transitions and loading animations.
- 2025-10-06T21:54:49.567Z — Created performance-optimized concert portfolio widget v4.6 with critical CSS inlining, modern JavaScript patterns, and reduced main-thread blocking. Addresses PageSpeed issues: render blocking resources, unused CSS/JS, and long tasks.
- 2025-10-06T21:54:42.902Z — Created performance-optimized concert portfolio widget v4.6 with critical CSS inlining, modern JavaScript patterns, and reduced main-thread blocking. Addresses PageSpeed issues: render blocking resources, unused CSS/JS, and long tasks. Added resource hints and lazy-loaded features.
- 2025-10-06T21:42:37.717Z — Fixed structured data detection issues in concert portfolio widget v4.5. Updated addBasicStructuredData function to properly calculate total images from manifest bands, generate absolute image URLs, and add comprehensive metadata. Added debug functionality to check structured data locally. Structured data now includes proper Schema.org ImageGallery markup with image URLs, author info, and SEO metadata.
- 2025-10-06T21:37:13.769Z — Successfully implemented SEO enhancements for concert portfolio widget v4.5 including structured data, enhanced alt text generation, and accessibility improvements. Images are now loading properly and SEO features are working.
- 2025-10-06T21:19:20.741Z — Session complete: minor updates.
- 2025-10-06T21:19:09.070Z — Successfully tested and fixed VS Code tasks for Copilot AI workflow. Fixed PowerShell quoting issues in widget validation task, created proper Node.js validation script, and verified all core tasks work correctly.
- 2025-10-06T21:13:03.277Z — Session complete: minor updates.
- 2025-10-05T07:48:39.395Z — Updated test widgets to latest versions - journalism widget updated from v3.0 to v4.9 with latest features
- 2025-10-04T00:00:00.003Z — Added agent responsibilities and widget preview workflow guidance: agents must read/update instructions and use user-driven preview workflow instead of external hosting
- 2025-10-03T09:15:17.087Z — Featured Portfolio Widget v1.5 complete: Enhanced journalism titles, ultra-minimal scrollbars (4px, 0.15 opacity), improved masonry spacing (16px gaps), randomized cover images with Fisher-Yates shuffle, minimal gray accents (#888888), production-ready deployment with 15-item limit, scrollable lightbox, and comprehensive changelog documentation
- 2025-10-03T09:15:11.680Z — Session complete: minor updates.
- 2025-10-03T07:08:00.405Z — Fixed featured portfolio widget by creating generate-featured-manifest.js script and updated widget to v1.2 with better debugging
- 2025-10-03T06:29:14.363Z — Validation: preflight/guardian/canvas/codex added and tasks wired
- Entries below are appended by the AI finalize script to summarize what the last VS Code agent session changed.
