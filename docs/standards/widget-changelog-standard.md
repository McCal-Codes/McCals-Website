# Widget Changelog Standard (November 2025)

> Purpose: Provide a uniform, automatable format for per-widget and aggregate CHANGELOG entries supporting CI validation, historical analytics, and CDN pinning.
> Status: Draft (ready for adoption) — integrate into existing widget READMEs and root CHANGELOG.

---
## 1. File Locations
- Per widget: `src/widgets/<widget>/CHANGELOG.md`
- Root/global: `CHANGELOG.md` (high-level, cross-widget summaries)
- Optional aggregate index: `docs/CHANGELOG.md` (roll-up of all widget versions for external documentation site)

## 2. Format Conventions
Use modified Keep a Changelog + semantic versioning:
```markdown
# Changelog
All notable changes to <Widget Name> will be documented here.

## [1.2.0] - 2025-11-19
### Added
- New feature description...
### Changed
- Refinement description...
### Fixed
- Bug description...
### Performance
- Metrics snapshot (FCP: 1.7s → 1.4s, LCP: 2.4s → 2.0s)
### Accessibility
- Contrast improvement, aria adjustments

## [1.1.1] - 2025-11-11
### Fixed
- Hotfix for inverted Light/Dark semantics.
```

Rules:
- Sections appear only if relevant; omit empty headings.
- Date in ISO format (UTC date; no time) `YYYY-MM-DD`.
- Version bracket formatting `## [MAJOR.MINOR.PATCH] - DATE`.
- Performance metrics optional but encouraged after significant improvements.

## 3. Mandatory Sections When Present
- **Added**: New features or capabilities.
- **Changed**: Altered behavior or refinements.
- **Fixed**: Bug fixes.
- **Removed**: Features removed or deprecated.
- **Security**: Vulnerabilities addressed.

## 4. Optional Sections
- **Performance**: Provide before/after metrics or qualitative improvements.
- **Accessibility**: Document WCAG-related changes.
- **SEO**: Structured data, alt text strategy updates.
- **Maintenance**: Refactors, internal reorganization.
- **Deprecation Notices**: Indicate grace period if breaking changes upcoming.

## 5. Version Advancement Rules
| Change Type | Bump | Description |
|-------------|------|-------------|
| Patch | +0.0.1 | Backwards-compatible bug fix, micro performance tweak |
| Minor | +0.1.0 | Backwards-compatible feature(s), noticeable UX changes |
| Major | +1.0.0 | Breaking markup/data contract or large redesign |

## 6. Git Tag & CDN Sync
After updating a widget CHANGELOG for a release:
1. Commit the new version file & CHANGELOG entry.
2. Tag using `<widget>@<version>`.
3. Push tag: `git push origin <widget>@<version>`.
4. Update README embed snippet to point to new tag.

## 7. CI Validation (Planned)
Future workflow will:
- Parse each `src/widgets/*/CHANGELOG.md` for newest version block.
- Validate that newest version matches latest HTML version file name and contains at least one section (Added/Changed/Fixed/etc.).
- Check that active widget directory contains ≤2 version HTML files and that CHANGELOG includes the newest version's ISO date within ±3 days of commit date.
- Optionally diff structured data block or performance metrics to flag regressions.

## 8. Archival Coordination
When archiving older versions:
- Ensure their entries remain in the per-widget CHANGELOG (do not delete history).
- Add summary entry to root CHANGELOG if archival represented major consolidation.
- CI will ignore archived HTML files (no `data-active="true"` badge) but still parse CHANGELOG history.

## 9. Performance Metrics Embedding
Embed metrics succinctly:
```
### Performance
FCP: 1.9s → 1.5s (−21%) | LCP: 2.8s → 2.2s (−22%) | TBT: 180ms → 95ms
```
Avoid verbose narrative; keep quantifiable deltas; place methodology in case studies document.

## 10. Accessibility Metrics Embedding
```
### Accessibility
Axe critical issues: 3 → 0 | Contrast warnings: 5 → 1 | Keyboard trap: resolved
```

## 11. Common Anti-Patterns (Avoid)
- Editing old version blocks after release (except to fix typos)
- Missing dates or mixing date formats
- Collapsing multi-version history into combined entries
- Using marketing language instead of factual changes

## 12. Template
```
## [X.Y.Z] - YYYY-MM-DD
### Added
- ...
### Changed
- ...
### Fixed
- ...
### Performance
- (Optional) FCP/LCP/TBT deltas
### Accessibility
- (Optional) Issues resolved / improvements
### SEO
- (Optional) Structured data / alt text updates
```

## 13. Next Steps / TODO
- TODO: Implement CI changelog validator (`scripts/utils/validate-changelogs.js`).
- TODO: Add GitHub Action to comment summary of widget changes on PRs.
- TODO: Add automated metrics snapshot injection into CHANGELOG via script.

---
*Last updated: 2025-11-19*
