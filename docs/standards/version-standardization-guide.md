# Version Standardization Guide

## Overview

All version numbers in this repository follow **Semantic Versioning 2.0.0** with the format `MAJOR.MINOR.PATCH` (e.g., `1.4.0`, not `1.4`).

This ensures:
- ✅ Consistent version comparisons
- ✅ Proper sorting in dropdowns
- ✅ Clear upgrade paths
- ✅ Automated tooling compatibility

---

## Format Requirements

### ✅ Correct

```
Version: 1.4.0
@version 2.6.0
version: '4.7.0'
"version": "1.0.0"
```

### ❌ Incorrect

```
Version: 1.4
@version 2.6
version: '4.7'
"version": "1.0"
```

---

## Automated Standardization

### Check Current State

```bash
npm run versions:check
```

Shows what would be changed without modifying files.

### Apply Standardization

```bash
npm run versions:standardize
```

Automatically converts all version numbers to x.x.0 format.

### Manual Script Usage

```bash
# Dry run (preview only)
node scripts/utils/standardize-versions.js --dry-run

# Verbose output
node scripts/utils/standardize-versions.js --dry-run --verbose

# Actually apply changes
node scripts/utils/standardize-versions.js
```

---

## What Gets Updated

### Widget Files (`src/widgets/**`)

**HTML Headers:**
```html
<!-- 
  Widget: Concert Portfolio
  Version: 4.7.0  ← Always x.x.0
-->
```

**JavaScript Variables:**
```javascript
version: '4.7.0',  // Always x.x.0
```

### Scripts (`scripts/**`)

**JSDoc Comments:**
```javascript
/**
 * Generate Concert Manifest
 * @version 1.0.0
 */
```

**Manifest Outputs:**
```javascript
{
  version: '2.0.0',
  generated: '...'
}
```

### Package Files

**package.json:**
```json
{
  "version": "2.5.3"
}
```

---

## Semantic Versioning Rules

### MAJOR.MINOR.PATCH

- **MAJOR** (X.0.0) - Breaking changes
  - API changes that break existing implementations
  - Removed features
  - Incompatible widget updates

- **MINOR** (x.X.0) - New features (backward compatible)
  - New widget features
  - New script capabilities
  - Non-breaking enhancements

- **PATCH** (x.x.X) - Bug fixes (backward compatible)
  - Bug fixes
  - Performance improvements
  - Documentation updates

---

## Version Increment Guidelines

### Widgets

**Breaking Change (Major):**
```
v4.7.0 → v5.0.0
- Changed manifest data structure
- Removed deprecated features
- Changed widget initialization
```

**New Feature (Minor):**
```
v4.7.0 → v4.8.0
- Added API support
- New filter option
- Additional debug features
```

**Bug Fix (Patch):**
```
v4.7.0 → v4.7.1
- Fixed lightbox bug
- Corrected CSS issue
- Updated error handling
```

### Scripts

**Breaking Change (Major):**
```
v1.0.0 → v2.0.0
- Changed CLI arguments
- Modified output format
- Incompatible with old manifests
```

**New Feature (Minor):**
```
v1.0.0 → v1.1.0
- Added new portfolio type
- New command-line option
- Enhanced error reporting
```

**Bug Fix (Patch):**
```
v1.0.0 → v1.0.1
- Fixed path handling
- Corrected date parsing
- Updated dependencies
```

---

## Widget-Specific Versioning

### Current Version Standards

| Widget | Current | Format | Notes |
|--------|---------|--------|-------|
| Concert Portfolio | 4.7.1 | x.x.x | API support in 4.7.1 |
| Event Portfolio | 2.6.0 | x.x.0 | Stable version |
| Photojournalism | 5.3.0 | x.x.0 | Latest features |
| Portrait Portfolio | 1.1.0 | x.x.0 | Production ready |
| Featured Portfolio | 1.6.0 | x.x.0 | Current stable |
| Site Navigation | 1.7.0 | x.x.0 | Performance optimized |
| Site Footer | 1.3.0 | x.x.0 | Accessibility enhanced |
| About Page | 1.4.6 | x.x.x | Contact updates |
| Policies/Legal | 1.1.0 | x.x.0 | Accessibility fixes |

---

## Changelog Updates

### Required Format

```markdown
## [1.4.0] - 2025-11-23

### Added
- New feature description

### Changed
- Modified behavior description

### Fixed
- Bug fix description
```

### Version Header

Always use bracketed version numbers:
```markdown
## [1.4.0] - YYYY-MM-DD  ✅
## 1.4.0 - YYYY-MM-DD    ❌
```

---

## Version Badges

### Widget Headers

```html
<!--
  McCal Media Widget: Concert Portfolio
  Version: 4.7.0
  Last Updated: 2025-11-23
  Author: Caleb McCartney
-->
```

### Script Headers

```javascript
/**
 * Generate Concert Manifest
 * @version 1.0.0
 * @description Creates manifest from concert photos
 */
```

---

## Git Tagging

### Widget Releases

```bash
# Tag format: widget-name@version
git tag concert-portfolio@4.7.0
git push origin concert-portfolio@4.7.0
```

### Script Releases

```bash
# Tag format: script-name@version
git tag manifest-generator@1.0.0
git push origin manifest-generator@1.0.0
```

### Repository Releases

```bash
# Tag format: v prefix for repo version
git tag v2.5.3
git push origin v2.5.3
```

---

## Verification

### Check All Versions

```bash
# Find all version declarations
grep -r "Version:" src/widgets --include="*.html" | grep -v "\.0\s*$"
grep -r "@version" scripts --include="*.js" | grep -v "\.0\s"
```

### Validate Semantic Versioning

```bash
# Should return no results (all versions are x.x.0)
npm run versions:check | grep "Would update"
```

---

## Migration Path

### From Old Format to New

**Before:**
- `Version: 1.4`
- `@version 2.6`
- `version: '4.7'`

**After (Automated):**
```bash
npm run versions:standardize
```

**Result:**
- `Version: 1.4.0`
- `@version 2.6.0`
- `version: '4.7.0'`

---

## CI/CD Integration

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for non-standard versions
node scripts/utils/standardize-versions.js --dry-run
if [ $? -ne 0 ]; then
  echo "❌ Non-standard version numbers detected"
  echo "Run: npm run versions:standardize"
  exit 1
fi
```

### GitHub Actions

```yaml
- name: Validate versions
  run: npm run versions:check
```

---

## Troubleshooting

### Version Comparison Issues

**Problem:** Dropdown shows "v1.10" before "v1.9"

**Solution:** Ensure all versions use x.x.0 format (not x.x)

### Git Tag Conflicts

**Problem:** Tag already exists

**Solution:**
```bash
git tag -d widget-name@1.0.0  # Delete local
git push origin :refs/tags/widget-name@1.0.0  # Delete remote
```

### Inconsistent Versions

**Problem:** Widget file says 1.4.0 but CHANGELOG says 1.4

**Solution:**
```bash
npm run versions:standardize
# Then manually update CHANGELOG.md
```

---

## Best Practices

1. **Always use x.x.0 format** - Even for first release (1.0.0, not 1.0)
2. **Update CHANGELOG first** - Before bumping version
3. **Tag after release** - Once changes are tested
4. **Consistent across files** - Widget HTML, README, CHANGELOG all match
5. **Run standardization script** - Before commits involving versions

---

## Quick Reference

```bash
# Check versions
npm run versions:check

# Fix versions
npm run versions:standardize

# Create widget release
git tag widget-name@x.x.0
git push origin widget-name@x.x.0

# Verify no version issues
npm run versions:check | grep "No version standardization needed"
```

---

## Resources

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Git Tagging Basics](https://git-scm.com/book/en/v2/Git-Basics-Tagging)

---

**Last Updated:** 2025-11-23  
**Script Version:** 1.0.0
