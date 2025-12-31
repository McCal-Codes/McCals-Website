# 2026 Repository Cleanup & Optimization Plan

**Created:** December 31, 2025  
**Status:** Ready for Execution  
**Goal:** Streamline the repository for efficient, maintainable work in 2026

---

## 🎯 Executive Summary

This plan consolidates legacy documentation, removes obsolete files, updates dependencies, and establishes clear organizational patterns for 2026. All changes are reversible and follow the principle of "read before writing."

---

## 📋 Cleanup Checklist

### 1. **Archive Legacy Phase-2 Documentation** ✅

**Rationale:** Phase 2 is complete. These files are historical artifacts that clutter the root directory.

**Action:**

- Move all `PHASE-2-*.md` files to `docs/archive/phase-2/`
- Keep `API-DEPLOYMENT-COMPLETE.md` and `WIDGET-HOT-RELOAD-FEATURE.md` in `docs/archive/`
- Update any references in active documentation

**Files to Archive:**

```
PHASE-2-COMPLETE.md
PHASE-2-DELIVERABLES.md
PHASE-2-DEPLOYMENT-CHECKLIST.md
PHASE-2-QUICK-REFERENCE.md
PHASE-2-SESSION-SUMMARY.md
PHASE-2-START-HERE.md
PHASE-2-SUMMARY.md
API-DEPLOYMENT-COMPLETE.md
WIDGET-HOT-RELOAD-FEATURE.md
```

---

### 2. **Remove System Artifacts** ✅

**Rationale:** `.DS_Store` and `nohup.out` are system-generated files that should not be tracked.

**Action:**

```bash
find . -name ".DS_Store" -type f -delete
rm -f nohup.out
```

**Prevention:** Already in `.gitignore`, but ensure they're not committed.

---

### 3. **Consolidate Root-Level Test Files** ✅

**Rationale:** Test/preview files should live in a dedicated directory, not the root.

**Action:**

- Move `preview-monochrome-nav.html` → `tests/previews/`
- Move `test-blog-admin.html` → `tests/previews/`
- Keep `serve-select.html` in root (it's a dev server entry point)

---

### 4. **Update Dependencies** 🔄

**Rationale:** Keep dependencies current for security, performance, and compatibility.

**Current Outdated Packages:**

```
@eslint/js: 9.39.1 → 9.39.2
@playwright/test: 1.56.1 → 1.57.0
autoprefixer: 10.4.22 → 10.4.23
express: 5.1.0 → 5.2.1
jsdom: 27.3.0 → 27.4.0
typescript-eslint: 8.48.1 → 8.51.0
```

**Major Version Considerations:**

- `eslint`: 8.57.1 → 9.39.2 (breaking changes, defer to Q1 2026)
- `chokidar`: 4.0.3 → 5.0.0 (test watchers first)
- `esbuild`: 0.23.1 → 0.27.2 (test build scripts)
- `open`: 10.2.0 → 11.0.0 (minor API changes)
- `react/react-dom`: 18.3.1 → 19.2.3 (Next.js compatibility check)
- `tailwindcss`: 3.4.18 → 4.1.18 (major rewrite, defer)

**Action:**

```bash
# Safe minor/patch updates
npm update @eslint/js @playwright/test autoprefixer express jsdom typescript-eslint playwright

# Test after update
npm run validate:widgets
npm run test
```

---

### 5. **Optimize `.gitignore`** ✅

**Rationale:** Remove duplicate entries and ensure comprehensive coverage.

**Action:**

- Remove duplicate `.DS_Store` entries (lines 2, 4, 76)
- Add missing patterns:

  ```
  # Additional system files
  .git-rewrite/

  # Additional test artifacts
  tests/previews/*.html

  # Additional build artifacts
  .turbo/
  ```

---

### 6. **Streamline Documentation Structure** ✅

**Current State:**

```
docs/
├── archive/          (19 items)
├── standards/        (26 items)
├── integrations/     (14 items)
├── workflows/        (5 items)
├── automation/       (1 item)
├── deployment/       (5 items)
├── widgets/          (2 items)
└── [9 root files]
```

**Action:**

- Move `docs/SESSION-SUMMARY-2025-12-06.md` → `docs/archive/sessions/`
- Consolidate `docs/automation/` into `docs/workflows/` (only 1 file)
- Create `docs/archive/phase-2/` for Phase 2 documents

---

### 7. **Package.json Cleanup** ✅

**Rationale:** Remove unused scripts, consolidate aliases, improve organization.

**Action:**

- Group scripts by category (dev, build, manifest, optimize, etc.)
- Remove deprecated scripts:
  - `deploy:placeholder` (already documented as archived)
  - `docker:*` (if not actively used)
- Consolidate duplicate functionality:
  - `dev` vs `serve:site` vs `dev:full`
  - `manifest:generate` vs individual manifest scripts

**Proposed Script Categories:**

```json
{
  "scripts": {
    "// --- Development ---": "",
    "dev": "...",
    "dev:with-api": "...",
    "dev:full": "...",

    "// --- Build & Deploy ---": "",
    "build": "...",
    "prebuild": "...",

    "// --- Manifests ---": "",
    "manifest:generate": "...",
    "manifest:concert": "...",

    "// --- Testing & Validation ---": "",
    "test": "...",
    "validate:widgets": "...",

    "// --- Utilities ---": "",
    "clean": "...",
    "repo:health": "..."
  }
}
```

---

### 8. **Scripts Directory Audit** 🔄

**Current State:** 101 items across 10 subdirectories

**Action:**

- Review `scripts/_archived/` (32 items) - ensure truly obsolete
- Consolidate `scripts/agents/` into `docs/agents/` (documentation, not scripts)
- Document all active scripts in `scripts/README.md`
- Add JSDoc comments to all utility scripts

---

### 9. **Widget Versioning Cleanup** 🔄

**Rationale:** Enforce ≤2 active versions per widget rule.

**Action:**

```bash
npm run scan:widget-versions
# Review output, archive old versions
```

**Target:** Each widget should have:

- Latest stable version (e.g., `v4.1.0.html`)
- Previous stable version (e.g., `v4.0.0.html`)
- Optional: `-WIP` version for active development

---

### 10. **Environment & Configuration** ✅

**Action:**

- Update `.env.example` with 2026 best practices
- Document all required environment variables in `docs/deployment/environment-variables.md`
- Add validation script: `scripts/utils/validate-env.js`

---

## 🚀 Execution Plan

### Phase 1: Safe Cleanup (No Breaking Changes)

1. Archive Phase-2 documentation
2. Remove system artifacts
3. Consolidate test files
4. Optimize `.gitignore`
5. Update documentation structure

**Estimated Time:** 30 minutes  
**Risk Level:** Low

### Phase 2: Dependency Updates

1. Update minor/patch versions
2. Test all critical workflows
3. Document any breaking changes

**Estimated Time:** 1 hour  
**Risk Level:** Medium

### Phase 3: Structural Improvements

1. Package.json reorganization
2. Scripts directory audit
3. Widget versioning cleanup
4. Environment configuration

**Estimated Time:** 2 hours  
**Risk Level:** Medium

---

## 📊 Success Metrics

- ✅ Root directory has ≤10 files
- ✅ All dependencies current (within 2 minor versions)
- ✅ All widgets follow ≤2 version rule
- ✅ `npm run repo:health` passes with 0 warnings
- ✅ All CI/CD workflows pass
- ✅ Documentation is current and organized

---

## 🔄 Maintenance Schedule (2026)

- **Monthly:** `npm outdated` review and safe updates
- **Quarterly:** Full dependency audit and major version planning
- **Bi-annually:** Widget version cleanup and archival
- **Annually:** Repository structure review and optimization

---

## 📝 Notes

- All changes will be committed with descriptive messages
- `CHANGELOG.md` will be updated with cleanup summary
- Archived files will remain in git history
- No production widgets will be modified without testing

---

## 🎯 2026 Repository Goals

1. **Maintainability:** Clear structure, minimal cruft
2. **Performance:** Optimized dependencies, efficient scripts
3. **Documentation:** Current, comprehensive, accessible
4. **Standards:** Consistent patterns, enforced via CI
5. **Scalability:** Ready for new widgets, features, and integrations

---

**Next Steps:** Review this plan, approve execution, and proceed with Phase 1.
