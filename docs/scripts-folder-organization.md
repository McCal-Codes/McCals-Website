
# Scripts Folder Organization and Archival — Standardization


## Overview


## Standards Statement

The following rules are **standardization requirements** for the McCal Media workspace. All contributors must follow these standards for scripts folder structure, archival, and maintenance. Any deviation must be documented and justified in the project documentation.

---

This document describes the required structure, archival policy, and efficiency standards for the `scripts/` folder in the McCal Media workspace. Follow these rules to ensure maintainability and clarity for all contributors.

## Folder Structure

- **manifest/**: Manifest generators and related scripts
- **watchers/**: Watcher scripts for auto-updating manifests or related data
- **utils/**: General utilities and shared helpers
- **admin/**: Admin-only tools, importers, and backend helpers
- **_archived/**: Scripts not actively used by widgets, npm scripts, or automation pipelines
- Do **not** place new scripts directly in the root `scripts/` folder

## Archival Policy

- Any script not referenced by npm scripts, not used by widgets, or not part of the active automation pipeline should be moved to `scripts/_archived/`
- When archiving, move the file and add a comment/header indicating it is not actively used
- Periodically review the scripts folder for unused or obsolete files and archive as needed

## Adding or Modifying Scripts

- Before adding new scripts, check for existing patterns and update the relevant README in each subfolder
- After any reorganization, validate all npm scripts and workflows to ensure nothing is broken
- Document all changes in `.github/copilot-instructions.md` and in the main `CHANGELOG.md` under Docs/Meta

## Efficiency and Maintenance

- Always keep the scripts folder clean and efficient to avoid confusion
- Never leave scripts in the root folder unless absolutely necessary (and document why)
- Validate that all scripts referenced by npm scripts are working after any move or reorganization

## Documentation

- Update this document, `.github/copilot-instructions.md`, and the main `CHANGELOG.md` whenever the scripts folder structure or archival policy changes

---

_Last updated: 2025-10-06_
