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

## 4. Preflight & Afterflight Checklists

### Preflight (Before Making Changes)
1. **Read Standards**: Review all relevant standards in `docs/standards/` (this document).
2. **Run Preflight Validation**: Use `npm run ai:preflight:short` or the VS Code "AI: Preflight (short)" task to check context awareness and workspace health.
3. **Check Documentation**: Ensure any planned changes are documented or justified in the appropriate standards file or README.
4. **Plan Organization**: Confirm new scripts, folders, or changes will follow the documented structure and archival policy.

### Afterflight (After Making Changes)
1. **Validate Scripts**: Run all npm scripts and workflows to ensure nothing is broken after changes.
2. **Check Efficiency**: Confirm no scripts are left in the root `scripts/` folder unless absolutely necessary (and documented).
3. **Archive Unused**: Move any unused or obsolete scripts to `scripts/_archived/` and add a comment/header.
4. **Update Documentation**: Record all changes in `.github/copilot-instructions.md`, `CHANGELOG.md`, and update standards docs as needed.
5. **Final Review**: Ensure the workspace remains organized, efficient, and easy to maintain for future contributors.

---

## 5. Documentation & Reference

- All standards and organization rules are in `docs/standards/`. Always fall back to these documents for guidance.
- If in doubt, document your process and decisions for future maintainers.

---

_Last updated: 2025-10-06_
