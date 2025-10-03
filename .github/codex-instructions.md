## Codex instructions — efficient usage in VS Code (rate‑limit friendly)

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

Batch related changes

- Group 2–5 complementary edits in one call (e.g., new widget version + README note + small CSS fix).
- Avoid splitting into multiple agent calls unless there’s real uncertainty.

Prefer repo conventions

- Follow existing class names, data attributes, and naming. Use existing helpers: `enhanced-manifest-generator.js`, `watch-auto-manifest.js`.
- Keep platform-neutral Node (no shell-only assumptions). Inline assets for widgets; no external fonts.

Validate cheaply

- Sanity-check diffs compile: basic syntax, correct paths, and consistent version increments.
- If needed, run the minimal local check: build copies `src/site` and `src/images` → `dist/`; server at http://localhost:3000.

Avoids

- Broad repo rewrites, large refactors without clear need, or speculative test generation.
- Multi-round clarifications for choices that repo conventions already decide.

PR/Docs discipline

- If core flows change or instructions are impacted, update `.github/copilot-instructions.md` and `.github/canvas-instructions.md` and add a brief `CHANGELOG.md` entry (Docs/Meta). The PR guard will remind you.

Recent updates

- 2025-10-03T07:08:00.405Z — Fixed featured portfolio widget by creating generate-featured-manifest.js script and updated widget to v1.2 with better debugging
- 2025-10-03T06:29:14.363Z — Validation: preflight/guardian/canvas/codex added and tasks wired
- Entries below are appended by the AI finalize script to summarize what the last VS Code agent session changed.
