## Canvas instructions — McCal Media widgets workspace

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

- 2025-10-03T07:08:00.405Z — Fixed featured portfolio widget by creating generate-featured-manifest.js script and updated widget to v1.2 with better debugging
- 2025-10-03T06:29:14.362Z — Validation: preflight/guardian/canvas/codex added and tasks wired
- Entries below are appended by the AI finalize script to summarize the last Canvas/agent session changes.
