# Preflight & Afterflight Standards — Workspace Organization & Validation

## Purpose

To ensure all contributors follow a consistent process for validating, documenting, and maintaining workspace organization and script efficiency before and after making changes.

---

## Preflight Checklist (Before Making Changes)

1. **Read Standards**: Review all relevant standards in `docs/standards/` (especially `scripts-folder-organization.md`).
2. **Run Preflight Validation**: Use `npm run ai:preflight:short` or the VS Code "AI: Preflight (short)" task to check context awareness and workspace health.
3. **Check Documentation**: Ensure any planned changes are documented or justified in the appropriate standards file or README.
4. **Plan Organization**: Confirm new scripts, folders, or changes will follow the documented structure and archival policy.

---

## Afterflight Checklist (After Making Changes)

1. **Validate Scripts**: Run all npm scripts and workflows to ensure nothing is broken after changes.
2. **Check Efficiency**: Confirm no scripts are left in the root `scripts/` folder unless absolutely necessary (and documented).
3. **Archive Unused**: Move any unused or obsolete scripts to `scripts/_archived/` and add a comment/header.
4. **Update Documentation**: Record all changes in `.github/copilot-instructions.md`, `CHANGELOG.md`, and update standards docs as needed.
5. **Final Review**: Ensure the workspace remains organized, efficient, and easy to maintain for future contributors.

---

## Reference
- All standards and organization rules are in `docs/standards/`. Always fall back to these documents for guidance.
- If in doubt, document your process and decisions for future maintainers.

_Last updated: 2025-10-06_
