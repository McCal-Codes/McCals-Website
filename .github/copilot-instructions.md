## Copilot instructions for McCal Media widgets workspace

Purpose and scope

- This repo is a development workspace for Squarespace widgets. The Squarespace site embeds versioned widget HTML from `src/widgets/**`. The `src/site/` app is a local test harness only; production is Squarespace.

Source layout you’ll use most

- `src/widgets/` — primary deliverables (self‑contained HTML widgets with inline CSS/JS). Each widget has its own README and versioned files.
- `src/images/` — portfolio assets consumed by widgets and local test site.
- `src/site/` — local demo app (`index.html`, `app.js`, `styles.css`) to preview data flows and layouts.
- `scripts/` — Node scripts for organizing photos and generating manifests.
- `dist/` — build output (generated). Do not edit by hand.

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
- Generator details: `scripts/enhanced-manifest-generator.js` extracts dates from filenames (YYMMDD, YYYYMMDD, some DD-MM-YY cases like `13-01-24` → 2024-12-13) or EXIF (`DateTime`, `DateTimeOriginal`). Writes `manifest.json` in each date folder and `processing-summary.json` at Concert root.
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
- Versioning: keep versioned HTML files (e.g., `versions/vN.M.html`) and update per-widget CHANGELOGs if present; repo-level policy is in `docs/VERSIONING.md`.
- Don’t couple widgets to the local test site; widgets read from manifests and/or remote assets. Keep selectors/namespaces stable for Squarespace.

Local test site patterns (for previews only)

- `src/site/app.js` is a vanilla JS SPA demo that reads manifests (example: Funky Lamp folder `manifest.json`, expects fields like `images[]`, `totalImages`, optional `concertDate.{year,month,day,iso}`). If you change manifest shapes, update generators and this app together.

Integration points and external deps

- Scripts use Node fs/path and `exif-parser` to read EXIF; avoid shell-specific assumptions (works on Windows/macOS/Linux). Optional CLIs for deploys: `netlify-cli`, `vercel`, `surge`.

Safe-change checklist for agents

- Add/modify images under `src/images/**`; never commit edits to `dist/**`.
- Run manifests before testing: `npm run manifest:generate` or start the watcher.
- Keep widget code self-contained; don’t import from the test app.
- Preserve folder naming (Band/Month Year) and filename date patterns when possible—generators rely on them.
- If adding scripts, follow existing patterns (`scripts/*.js`, cross‑platform Node only). If changing manifest fields, update: generator, CI, docs, and any consumers in `src/site/` and widgets that read them.

Good starting references

- `scripts/enhanced-manifest-generator.js` — manifest schema and date logic.
- `scripts/watch-auto-manifest.js` — recommended dev loop.
- `src/widgets/**/README.md` — embedding instructions and constraints.
- `src/site/app.js` — example data flow from manifests to UI.

Change management

- When you update this file, add a brief entry to `CHANGELOG.md` under Docs/Meta noting what changed. A PR check will remind/fail if missing.

Recent updates

- 2025-10-03T07:08:00.400Z — Fixed featured portfolio widget by creating generate-featured-manifest.js script and updated widget to v1.2 with better debugging
- 2025-10-03T06:29:14.357Z — Validation: preflight/guardian/canvas/codex added and tasks wired
- Entries below are appended by the AI finalize script to record what the last agent session changed.
