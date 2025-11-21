#
## See Also

- [widget-standards.md](./widget-standards.md)
- [widget-reference.md](./widget-reference.md)
- [widget-enhancements.md](./widget-enhancements.md)
- [widget-development.md](./widget-development.md)
- [versioning.md](./versioning.md)
- [date-naming.md](./date-naming.md)
# Workspace Organization, Validation & Scripts — Standardization

## Purpose

This document combines all standards for scripts folder organization, workspace validation, and preflight/afterflight checklists. It is the single source of truth for maintaining an efficient, organized, and well-documented workspace.

---

## 1. Folder Structure & Archival Policy

- **manifest/**: Manifest generators and related scripts
- **watchers/**: Watcher scripts for auto-updating manifests or related data
- **utils/**: General utilities and shared helpers
- **admin/**: Admin-only tools, importers, and backend helpers
- **_archived/**: Scripts not actively used by widgets, npm scripts, or automation pipelines
- Do **not** place new scripts directly in the root `scripts/` folder

### Archival Policy
- Any script not referenced by npm scripts, not used by widgets, or not part of the active automation pipeline should be moved to `scripts/_archived/`
- When archiving, move the file and add a comment/header indicating it is not actively used
- Periodically review the scripts folder for unused or obsolete files and archive as needed

---

## 2. Adding or Modifying Scripts

- Before adding new scripts, check for existing patterns and update the relevant README in each subfolder
- After any reorganization, validate all npm scripts and workflows to ensure nothing is broken
- Document all changes in `.github/copilot-instructions.md` and in the main `CHANGELOG.md` under Docs/Meta

---

## 3. Efficiency and Maintenance

- Always keep the scripts folder clean and efficient to avoid confusion
- Never leave scripts in the root folder unless absolutely necessary (and document why)
- Validate that all scripts referenced by npm scripts are working after any move or reorganization

---

## 4. GitHub Actions Workflow Standards

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

### Portfolio Automation
- **Manifest Workflows**: Every portfolio type should have automated manifest generation (e.g., `portrait-manifest.yml`, `nature-manifest.yml`)
- **Trigger Conditions**: Watch for changes in respective portfolio directories (e.g., `src/images/Portfolios/Portrait/**`)
- **Manual Triggers**: Include `workflow_dispatch` for manual regeneration

---

## 5. Preflight & Afterflight Checklists

### Preflight (Before Making Changes)
1. **Read Standards**: Review all relevant standards in `docs/standards/` (this document).
2. **Run Preflight Validation**: Use `npm run ai:preflight:short` or the VS Code "AI: Preflight (short)" task to check context awareness and workspace health.
3. **Check Documentation**: Ensure any planned changes are documented or justified in the appropriate standards file or README.
4. **Plan Organization**: Confirm new scripts, folders, or changes will follow the documented structure and archival policy.
5. **Validate Workflows**: If modifying workflows, run `node scripts/utils/ci-validate-workflows.js` to check references and best practices.

### Afterflight (After Making Changes)
1. **Validate Scripts**: Run all npm scripts and workflows to ensure nothing is broken after changes.
2. **Check Efficiency**: Confirm no scripts are left in the root `scripts/` folder unless absolutely necessary (and documented).
3. **Archive Unused**: Move any unused or obsolete scripts to `scripts/_archived/` and add a comment/header.
4. **Update Documentation**: Record all changes in `.github/copilot-instructions.md`, `CHANGELOG.md`, and update standards docs as needed.
5. **Final Review**: Ensure the workspace remains organized, efficient, and easy to maintain for future contributors.
6. **Health Check**: Run `npm run repo:health` (or manual equivalent on macOS) and smoke tests to verify no regressions.

---

## 6. Documentation & Reference

- All standards and organization rules are in `docs/standards/`. Always fall back to these documents for guidance.
- If in doubt, document your process and decisions for future maintainers.
- Workflow standards are detailed in `.github/WORKFLOWS.md`.
 
## Single-Portfolio Manifest Policy (2025-11)

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
- Older versions are moved (Phase 2 physical relocation) to `src/widgets/_archived/legacy-widget-versions/<widget>/versions/`.
- Each archive subdirectory will include an `INDEX.json` enumerating `{ version, date, summary }` for traceability and automated audits.
- Active versions should expose a version badge with `data-active="true"`; archived files omit the attribute (enables future CI validation).
- Widget README files list only active versions and link to the archive index for history.

Planned CI additions:
1. Enforce ≤2 active versions per widget.
2. Validate newest version has a corresponding CHANGELOG entry.
3. Warn if archived versions still reside in live directories after Phase 2 migration window.

## Composite Manifest Workflow Shadowing (2025-11)

To validate consolidation, a composite shadow workflow (`.github/workflows/manifest-composite.yml`) was introduced. It runs a matrix covering: concert, events, journalism, nature, portrait, universal.

Goals:
- Ensure consolidated generation produces identical outputs to individual workflows.
- Gather reliability data before decommissioning per-portfolio workflows.

Transition Plan:
1. Shadow workflow runs alongside existing individual workflows for a probation period.
2. On consistent PASS (no divergence, JSON validation stable) → retire individual workflows.
3. Update documentation & CI references to point at composite job only.

Agents modifying manifest logic must: (a) update composite workflow matrix if portfolios added/removed, (b) run local validation (`npm run manifest:dry-run`) before committing.

---

_Last updated: 2025-11-03_
