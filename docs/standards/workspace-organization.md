#

# ⚡️ Site Architecture Clarification (2026)

**Production Site:** The official production website is built with Vite and lives in `sites/mcc-cal-vite/` (or equivalent). All standards, deployment, and validation workflows should prioritize the Vite site as the canonical source for production.

**Internal Admin App:** The internal operations console lives in `sites/mcc-cal-admin/` and should be treated as a separate Vercel project with its own deployment protection, environment variables, and validation workflow. It is not part of the public site runtime.

**Development/Preview Site:** The `dev.mcc-cal.com` site (Next.js, in `sites/dev.mcc-cal.com/`) is for development, preview, and integration testing only. It is not the production runtime and should not be referenced as the main site in standards or documentation.

**Legacy Widgets:** Widget-centric workflows and standards are now considered legacy. Only update widget docs or workflows if maintaining backward compatibility or for archival purposes. All new work should focus on the Vite site.

## See Also



# Workspace Organization, Validation & Scripts — Standardization

**Quick links:** [Onboarding](../ONBOARDING.md) · [UI Patterns](./ui-patterns.md) · [Enhancements](./enhancements.md) · [Debugging](./debugging.md) · [Changelog Standard](./changelog-standard.md)

## Purpose


This document combines all standards for scripts folder organization, workspace validation, and preflight/afterflight checklists. It is the single source of truth for maintaining an efficient, organized, and well-documented workspace.

---

## Vite & Modern Web Tooling

- **Vite-first:** All new scripts, build tools, and workflows should assume a Vite-based site as the canonical production target.
- **ESM by default:** Use ES modules for all new scripts and utilities. Prefer `import`/`export` over `require`/`module.exports`.
- **Modern npm scripts:** Use `vite`, `vite build`, `vite preview`, and `vite lint` as the baseline for validation and local development.
- **TypeScript:** Prefer TypeScript for new scripts/utilities. Use `ts-node` or Vite's built-in support for dev scripts.
- **Static assets:** Place all public/static assets in the Vite `public/` directory or as recommended by Vite. Use hashed filenames for cache-busting.
- **CDN best practices:** For production, serve static assets via a CDN. Reference assets using Vite's asset handling (`import img from './logo.png'`).

---


## 1. Folder Structure & Archival Policy (Vite/Next.js Hybrid)

- **manifest/**: Manifest generators and related scripts
- **watchers/**: Watcher scripts for auto-updating manifests or related data
- **utils/**: General utilities and shared helpers
- **admin/**: Admin-only tools, importers, and backend helpers
- **\_archived/**: Scripts not actively used by widgets, npm scripts, or automation pipelines
- Do **not** place new scripts directly in the root `scripts/` folder


### Static Assets & CDN
- Place all static assets (images, fonts, etc.) in `sites/mcc-cal-vite/public/` for Vite, or the equivalent public folder for Next.js.
- Use hashed filenames for cache-busting in production.
- Reference assets using Vite's asset import syntax or Next.js static imports.
- For CDN, ensure correct cache headers and versioning.

### Archival Policy

- Any script not referenced by npm scripts, not used by widgets, or not part of the active automation pipeline should be moved to `scripts/_archived/`
- When archiving, move the file and add a comment/header indicating it is not actively used
- Periodically review the scripts folder for unused or obsolete files and archive as needed

---


## 2. Adding or Modifying Scripts (Vite/Modern)

- Before adding new scripts, check for existing patterns and update the relevant README in each subfolder
- After any reorganization, validate all npm scripts and workflows to ensure nothing is broken
- Document all changes in `.github/copilot-instructions.md` and in the main `CHANGELOG.md` under Docs/Meta

---


## 3. Efficiency and Maintenance (Vite/Modern)

- Always keep the scripts folder clean and efficient to avoid confusion
- Never leave scripts in the root folder unless absolutely necessary (and document why)
- Validate that all scripts referenced by npm scripts are working after any move or reorganization

---


## 4. GitHub Actions Workflow Standards (Vite/Modern)

### Workflow Organization

- **File Placement**: Keep workflows in `.github/workflows/` with clear naming (e.g., `ci-*.yml`, `deploy-*.yml`, `manifest-*.yml`)
- **Deterministic Installs**: Always use `npm ci --prefer-offline --no-audit --no-fund` for Node dependencies
- **Caching**: Cache npm (`~/.npm`) and heavy assets (Playwright browsers at `~/.cache/ms-playwright`) keyed by `package-lock.json` hash
- **Dry Runs**: Use dry-run flags for validation to avoid accidental writes (e.g., `--dry` on manifest generators)
- **Artifacts**: Upload reports and logs using `actions/upload-artifact` for diagnostics

### Workflow Validation

- **Pre-Commit Validation**: Run `node scripts/utils/ci-validate-workflows.js` locally when modifying workflows
- **CI Validation**: Include `validate-workflows.yml` job that checks script references and best practices
- **Cross-Platform Compatibility**: Ensure scripts work on Windows/macOS/Linux; avoid PowerShell-only commands in shared scripts


### Vite-Specific Validation
- Always run `npm run lint`, `npm run type-check`, and `npm run build` before committing changes.
- Use `vite preview` to validate production builds locally.
- For CI, ensure workflows run `vite build` and `vite preview` smoke tests.

- **Manifest Workflows**: Every portfolio type should have automated manifest generation (e.g., `portrait-manifest.yml`, `nature-manifest.yml`)
- **Trigger Conditions**: Watch for changes in respective portfolio directories (e.g., `src/images/Portfolios/Portrait/**`)
- **Manual Triggers**: Include `workflow_dispatch` for manual regeneration

---


## 5. Preflight & Afterflight Checklists (Vite/Modern)


### Preflight (Before Making Changes)
1. **Run Vite Preflight:** Use `npm run ai:preflight:short` and `vite build` to check for errors before starting work.

1. **Read Standards**: Review all relevant standards in `docs/standards/` (this document).
2. **Run Preflight Validation**: Use `npm run ai:preflight:short` or the VS Code "AI: Preflight (short)" task to check context awareness and workspace health.
3. **Check Documentation**: Ensure any planned changes are documented or justified in the appropriate standards file or README.
4. **Plan Organization**: Confirm new scripts, folders, or changes will follow the documented structure and archival policy.
5. **Validate Workflows**: If modifying workflows, run `node scripts/utils/ci-validate-workflows.js` to check references and best practices.


### Afterflight (After Making Changes)
1. **Run Vite Validation:** After changes, run `vite build`, `vite preview`, and all lint/type-check scripts to ensure no regressions.

1. **Validate Scripts**: Run all npm scripts and workflows to ensure nothing is broken after changes.
2. **Check Efficiency**: Confirm no scripts are left in the root `scripts/` folder unless absolutely necessary (and documented).
3. **Archive Unused**: Move any unused or obsolete scripts to `scripts/_archived/` and add a comment/header.
4. **Update Documentation**: Record all changes in `.github/copilot-instructions.md`, `CHANGELOG.md`, and update standards docs as needed.
5. **Final Review**: Ensure the workspace remains organized, efficient, and easy to maintain for future contributors.
6. **Health Check**: Run `npm run repo:health` (or manual equivalent on macOS) and smoke tests to verify no regressions.

---


## 6. Documentation & Reference (Vite/Modern)

- All standards and organization rules are in `docs/standards/`. Always fall back to these documents for guidance.
- If in doubt, document your process and decisions for future maintainers.
- Workflow standards are detailed in `.github/WORKFLOWS.md`.


---

## Troubleshooting & FAQ (Vite/Modern)

- **Vite build fails with ESM errors:** Ensure all scripts use `import`/`export` and update dependencies to ESM-compatible versions.
- **Static assets not loading:** Check asset paths and use Vite's asset import syntax. For CDN, verify cache headers and asset URLs.
- **TypeScript errors:** Run `npm run type-check` and ensure all types are up to date. Use Vite's built-in TS support.
- **Hot reload not working:** Restart the dev server and check for conflicting plugins or misconfigured paths.
- **Legacy widget issues:** Only update legacy widget scripts for critical fixes or migration. All new work should follow Vite standards.

- We now produce a single aggregated manifest per portfolio type (for example `portrait-manifest.json`, `concert-manifest.json`, `nature-manifest.json`) located at `src/images/Portfolios/<Type>/`.
- Per-folder `manifest.json` files are deprecated and should not be created or committed. This simplifies widget consumption and CI logic.
- If you have legacy per-folder manifests, use the cleanup utility at `scripts/manifest/remove-subfolder-manifests.js`. Example:

  node scripts/manifest/remove-subfolder-manifests.js

- CI/workflows were updated to stop adding per-folder `manifest.json` files; they now operate only on the aggregated manifests. If you maintain a watcher locally, run the watcher with `--force` to force regeneration when needed:

  node scripts/watchers/watch-auto-manifest.js --all --force

Note: This policy reduces manifest churn and avoids accidental per-folder manifest writes that previously caused confusion.

---

## Legacy Widget Version Archival (Phase 1 — 2025-11)

Reorganization Phase 1 established a standardized approach for handling historical widget versions:

- Live widget directories retain only the current stable + previous stable HTML version files.
- Older versions are moved (Phase 2 physical relocation) to `src/widgets/_archived/Legacy Widgets/<widget>/versions/`.
- Each archive subdirectory will include an `INDEX.json` enumerating `{ version, date, summary }` for traceability and automated audits.
- Active versions should expose a version badge with `data-active="true"`; archived files omit the attribute (enables future CI validation).
- Widget README files list only active versions and link to the archive index for history.

Planned CI additions:

1. Enforce ≤2 active versions per widget.
2. Validate newest version has a corresponding CHANGELOG entry.
3. Warn if archived versions still reside in live directories after Phase 2 migration window.

## Composite Manifest Workflow (retired 2025-12)

The experimental composite shadow workflow (`.github/workflows/manifest-composite.yml`) was removed after proving redundant. We now rely on:

- Per-portfolio workflows (concert, events, journalism, nature, portrait)
- `regenerate-all-manifests.yml` for manual bulk runs
- `publish-manifests-cdn.yml` for CDN pushes

Agents modifying manifest logic should continue to run local validation (`npm run manifest:dry-run`) and, for bulk checks, use `regenerate-all-manifests.yml` via `workflow_dispatch`.

---

_Last updated: 2025-11-03_
