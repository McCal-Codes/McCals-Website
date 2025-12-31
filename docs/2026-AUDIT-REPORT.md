# Repository Audit Report - Items to Archive/Clean

**Date:** December 31, 2025  
**Status:** Audit Complete

---

## 🔍 Findings Summary

Found **5 categories** of items that should be cleaned up or archived:

---

## 1. ✅ **Backup Files** (Safe to Archive)

### `package.json.backup`

- **Location:** Root directory
- **Purpose:** Safety backup created during Phase 3
- **Recommendation:** **Archive to `docs/archive/backups/`**
- **Reason:** Keep for reference, but move out of root

### `src/widgets/shared/theme.css.bak`

- **Location:** `src/widgets/shared/`
- **Size:** 4.6 KB
- **Content:** Old theme CSS from 2025-10-09
- **Recommendation:** **Delete** (current theme.css exists)
- **Reason:** Obsolete backup, no longer needed

---

## 2. 🗑️ **Build Artifacts** (Safe to Delete)

### Next.js Cache Files

- **Location:** `sites/dev.mcc-cal.com/.next/cache/webpack/`
- **Files:**
  - `client-production/index.pack.old`
  - `client-development/index.pack.gz.old`
  - `server-development/index.pack.gz.old`
  - `server-production/index.pack.old`
- **Recommendation:** **Delete** (build artifacts, regenerated automatically)
- **Command:**
  ```bash
  rm -rf sites/dev.mcc-cal.com/.next/cache/webpack/*/*.old
  ```

### Node Modules Temp

- **Location:** `node_modules/@paulirish/trace_engine/.tmp`
- **Recommendation:** **Ignore** (managed by npm, in .gitignore)

---

## 3. 📦 **Deprecated npm Scripts** (Should Remove)

### Docker Scripts (Not Actively Used)

```json
"docker:build": "docker build -t mccal-media-website .",
"docker:run": "docker run -p 8080:8080 mccal-media-website",
"docker:deploy": "docker build -t mccal-media-website . && docker run -d -p 8080:8080 --name mccal-website mccal-media-website"
```

- **Recommendation:** **Remove** from package.json
- **Reason:** Not actively used, no Dockerfile in root, adds clutter

### Deploy Placeholder

```json
"deploy:placeholder": "echo 'Deployment scripts archived. Use documented manual deployment workflow.'"
```

- **Recommendation:** **Remove** from package.json
- **Reason:** Placeholder serves no purpose, deployment is documented elsewhere

---

## 4. 📁 **Scripts Archive Review** (Already Archived)

### `scripts/_archived/` (32 files)

**Status:** ✅ Already properly archived

**Notable files that are correctly archived:**

- `auto-check-todo.js` - Replaced by newer version
- `auto-manifest-updater.js` - Replaced by watchers
- `date-overrides.js` - Functionality integrated elsewhere
- `find-latest-widget-versions.js` - Replaced by scan-widget-versions
- `generate-cdn-snippets.js` - Moved to \_archived
- `shared-date-parsing.js` - Symlinked to canonical version

**Recommendation:** ✅ **No action needed** - Archive is well-organized

---

## 5. ⚠️ **Nothing Broken** ✅

### Validation Results

```bash
npm run validate:widgets  # ✅ All pass
npm run repo:health       # ✅ All pass
npm audit                 # ✅ 0 vulnerabilities
```

**Status:** ✅ **No broken code or widgets found**

---

## 📋 Recommended Actions

### Immediate (Safe to Execute)

#### 1. Clean Build Artifacts

```bash
rm -rf sites/dev.mcc-cal.com/.next/cache/webpack/*/*.old
```

**Impact:** Removes 4 obsolete webpack cache files (~4 MB)

#### 2. Delete Obsolete Backup

```bash
rm src/widgets/shared/theme.css.bak
```

**Impact:** Removes 1 obsolete CSS backup (4.6 KB)

#### 3. Archive package.json.backup

```bash
mkdir -p docs/archive/backups
mv package.json.backup docs/archive/backups/package.json.2025-12-31.backup
```

**Impact:** Moves backup out of root directory

### Optional (Requires Testing)

#### 4. Remove Deprecated npm Scripts

Edit `package.json` and remove:

- `docker:build`
- `docker:run`
- `docker:deploy`
- `deploy:placeholder`

**Impact:** Cleaner package.json, removes 4 unused scripts  
**Risk:** Low (scripts not referenced anywhere)  
**Test:** Run `npm run repo:health` after removal

---

## 📊 Impact Summary

| Category               | Items | Action         | Impact               |
| ---------------------- | ----- | -------------- | -------------------- |
| **Backup Files**       | 2     | Archive/Delete | Cleaner root & src   |
| **Build Artifacts**    | 4     | Delete         | ~4 MB freed          |
| **Deprecated Scripts** | 4     | Remove         | Cleaner package.json |
| **Archived Scripts**   | 32    | None           | ✅ Already good      |
| **Broken Code**        | 0     | None           | ✅ All working       |

---

## ✅ Execution Plan

### Phase A: Safe Cleanup (Auto-Execute)

```bash
# Remove build artifacts
rm -rf sites/dev.mcc-cal.com/.next/cache/webpack/*/*.old

# Remove obsolete backup
rm src/widgets/shared/theme.css.bak

# Archive package.json backup
mkdir -p docs/archive/backups
mv package.json.backup docs/archive/backups/package.json.2025-12-31.backup
```

### Phase B: Package.json Cleanup (Manual)

1. Open `package.json`
2. Remove lines 35-37 (docker scripts)
3. Remove line 33 (deploy:placeholder)
4. Save and test: `npm run repo:health`

---

## 🎯 Expected Results

**After Cleanup:**

- ✅ Root directory: 30 → 29 files (package.json.backup moved)
- ✅ Disk space: ~4 MB freed
- ✅ Package.json: 109 → 105 scripts
- ✅ All validation passes
- ✅ No broken code

---

## 📝 Files to Modify

### Will Delete

- `src/widgets/shared/theme.css.bak`
- `sites/dev.mcc-cal.com/.next/cache/webpack/*/*.old` (4 files)

### Will Move

- `package.json.backup` → `docs/archive/backups/package.json.2025-12-31.backup`

### Will Edit (Optional)

- `package.json` - Remove 4 deprecated scripts

---

**Ready to execute? All actions are safe and reversible via git.**
