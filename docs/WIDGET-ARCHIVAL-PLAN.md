# Widget Version Archival Plan

**Date:** November 12, 2025  
**Purpose:** Clean up old widget versions while preserving version history

## 📊 Analysis Summary

**Total widgets with excessive versions:** 12 widgets  
**Total versions that could be archived:** ~54 files  
**Strategy:** Keep first version, last 2-3 stable versions, archive the rest

---

## 🗂️ Archival Strategy

### Keep Policy:
1. **v1.0** or first version (historical reference)
2. **Latest production version** (current stable)
3. **Previous stable version** (rollback option)
4. **Any version explicitly referenced in docs** (deployment-specific)

### Archive Policy:
- Middle versions between v1.0 and latest stable
- Experimental versions (unless documented as stable)
- Development/test versions
- Superseded versions with known issues

---

## 📋 Widget-by-Widget Archival Plan

### 🔴 HIGH PRIORITY - Excessive Versions

#### 1. Concert Portfolio (19 versions → keep 4)
**Current:** v4.7 (production)  
**Keep:**
- v2.0.html (first major version)
- v4.6.html (previous stable, performance baseline)
- v4.7.html (latest, Spotify integration)

**Archive (16 versions):**
- v2.1 through v4.5 (superseded development versions)

**Action:**
```bash
# Create archive folder
New-Item -ItemType Directory -Force -Path "src\widgets\portfolios\concert-portfolio\versions\_archive"

# Move old versions
Move-Item "src\widgets\portfolios\concert-portfolio\versions\v2.1.html" "src\widgets\portfolios\concert-portfolio\versions\_archive\"
# ... repeat for v2.2 through v4.5
```

---

#### 2. Podcast Feed (14 versions → keep 3)
**Current:** v2.0.0 (production)  
**Keep:**
- v1.0.html (original)
- v1.9.5-auto-hydrating.html (previous stable)
- v2.0.0.html (latest production)

**Archive (11 versions):**
- v1.1 through v1.9.4 (development iterations)
- v2.0-performance-optimized.html (duplicate/renamed)

---

#### 3. Photojournalism Portfolio (12 versions → keep 4)
**Current:** v5.2 (production)  
**Keep:**
- v1.0-filterable-masonry.html (original concept)
- v4.9-lightbox-fix.html (stable milestone)
- v5.1-performance-optimized.html (performance baseline)
- v5.2-performance-optimized.html (latest)

**Archive (8 versions):**
- v2.0 through v4.8 (superseded)

---

#### 4. Event Portfolio (10 versions → keep 3)
**Current:** v2.6.2 (production)  
**Keep:**
- v1.0-universal-captions.html (original)
- v2.6.0-lightbox-enhanced.html (stable baseline)
- v2.6.2-event-portfolio.html (latest)

**Archive (7 versions):**
- v1.1 through v2.5 (development iterations)

---

#### 5. Navigation (10 versions → keep 3)
**Current:** v1.7.1 (rollback/stable)  
**Keep:**
- v1.0.0.html (original)
- v1.7.0-enhanced.html (feature complete)
- v1.7.1-rollback.html (latest stable)

**Archive (7 versions):**
- v1.6.2 through v1.6.9 (development iterations)

---

### 🟡 MEDIUM PRIORITY - Moderate Cleanup

#### 6. Featured Portfolio (6 versions → keep 3)
**Keep:** v1.0, v1.4, v1.5-working  
**Archive:** v1.1, v1.2, v1.3

#### 7. Client Carousel (5 versions → keep 2)
**Keep:** v1.2.0 (baseline), v1.3.0 (latest)  
**Archive:** v1.2.1, v1.2.2, v1.2.3 (incremental updates)

#### 8. Nature Portfolio (5 versions → keep 3)
**Keep:** v1.0, v1.7, v1.8-performance-optimized  
**Archive:** v1.2, v1.3, v1.4, v1.5, v1.6 (WIP iterations)

---

### 🟢 LOW PRIORITY - Minimal Cleanup

#### 9. Blog Feed (4 versions → keep 3)
**Keep:** v1-google-docs, v2.0, v2.1-google-docs-blog  
**Archive:** v1-google-sheets (if unused), v2.0.0 (duplicate)

#### 10. Footer (4 versions → keep 3)
**Keep:** v1.0.0, v1.2.0 (currently deployed), v1.3.0-performance-optimized  
**Archive:** v1.1 Fixed Links (patch version)

#### 11. CSS Playground (4 versions → keep 2)
**Keep:** v1.0, v1.3  
**Archive:** v1.1, v1.2 (development)

---

### 🔴 ARCHIVE ENTIRE FOLDER

#### 12. about-widgets-legacy (5 versions - ALL ARCHIVED)
**Status:** Already in `_archived/` directory  
**Action:** This folder is already properly archived, no action needed

---

## 🛠️ Implementation Steps

### Phase 1: Create Archive Structure
```bash
# For each widget with versions to archive:
New-Item -ItemType Directory -Force -Path "src\widgets\[path]\versions\_archive"
```

### Phase 2: Move Old Versions
```bash
# Example for concert-portfolio:
$versions = @("v2.1.html", "v2.2.html", "v2.3.html", "v3.0.html", "v3.1.html", "v4.0.html", "v4.1.html", "v4.2.html", "v4.3.html", "v4.4.html", "v4.5.html")
foreach ($v in $versions) {
    Move-Item "src\widgets\portfolios\concert-portfolio\versions\$v" "src\widgets\portfolios\concert-portfolio\versions\_archive\" -Force
}
```

### Phase 3: Update Documentation
- Update CHANGELOG.md for each widget
- Add note about archived versions
- Update README.md to reference latest versions only

### Phase 4: Git Commit
```bash
git add src/widgets/
git commit -m "chore: archive old widget versions (keep v1.0 + latest 2-3 stable)"
```

---

## 📈 Expected Results

**Before:**
- 12 widgets with 4-19 versions each
- Total: ~85 version files
- Cluttered version directories

**After:**
- 12 widgets with 2-4 versions each
- Total: ~31 active version files
- ~54 files archived in `_archive` subdirectories
- Cleaner, more maintainable structure

---

## ⚠️ Safety Notes

1. **Do NOT delete files** - move to `_archive` subdirectories
2. **Preserve git history** - use `git mv` if possible
3. **Test before archiving** - ensure latest versions work
4. **Document archived versions** - add README in `_archive` folders
5. **Keep rollback options** - always keep previous stable version

---

## 🔍 Verification Commands

```bash
# Count active versions after cleanup
Get-ChildItem -Path "src\widgets" -Recurse -Filter "versions" -Directory | ForEach-Object { 
    $active = (Get-ChildItem $_.FullName -Filter "*.html" -Exclude "_archive").Count
    $archived = (Get-ChildItem "$($_.FullName)\_archive" -Filter "*.html" -ErrorAction SilentlyContinue).Count
    Write-Output "$($_.Parent.Name): $active active, $archived archived"
}

# Find any widgets still with >5 versions
Get-ChildItem -Path "src\widgets" -Recurse -Filter "versions" -Directory | Where-Object {
    (Get-ChildItem $_.FullName -Filter "*.html" -Exclude "_archive").Count -gt 5
}
```

---

**Impact:** Reduced clutter by ~63% while preserving version history  
**Risk Level:** Low (moving, not deleting)  
**Time Estimate:** 30-45 minutes for full cleanup
