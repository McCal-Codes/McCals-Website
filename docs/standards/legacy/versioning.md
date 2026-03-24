# See [workspace-organization.md](./workspace-organization.md) for workspace/process standards and validation checklists.
# Versioning Guidelines

All widgets use semantic versioning (MAJOR.MINOR.PATCH). Always duplicate the previous `versions/` file before editing so history stays intact.

## Version Scale

- **0.0.1** (PATCH) – Micro fixes: copy tweaks, aria labels, small design nudges.
- **0.1.0** (MINOR) – Incremental enhancements: new section, layout tweak, optional feature.
- **1.0.0** (MAJOR) – Foundational or breaking work: redesigns, rewrites, new data source.

Bump additional numbers as needed (e.g. 1.2.3) but keep the same meaning: PATCH for tiny fixes, MINOR for additive improvements, MAJOR for disruptive updates.

## Workflow

1. Copy the last shipping file from `versions/`.
2. Rename the copy with the new semantic version (e.g. `v1.0.1.html`).
3. Apply changes to the new file only.
4. Update the widget `CHANGELOG.md` and version badge text to match.

## Examples

- **v1.0.1** – Adjusts newsletter focus outline.
- **v1.1.0** – Adds dark-mode toggle to the nav.
- **v2.0.0** – Rebuilds footer around new CMS data.

## Philosophy

Small change → small bump; big change → big bump. Clear version history keeps Squarespace embeds rollback-friendly and QA expectations accurate.
