# Widget API Migration Cheat Sheet

**Quick guide for adding API support to portfolio widgets**

---

## 1️⃣ Add Data Attribute (HTML)

```html
<!-- Before -->
<div id="widgetPf" data-panes="24">

<!-- After -->
<div id="widgetPf" data-panes="24" data-api="off">
```

---

## 2️⃣ Read Config (JavaScript)

```javascript
// Add near widget initialization
const portfolio = document.getElementById('widgetPf');
const useAPI = portfolio && portfolio.dataset.api === 'on';
```

---

## 3️⃣ Update loadManifest Function

```javascript
// Before: Only GitHub Raw
async function loadManifest(force = false) {
  if (!force) {
    const cached = cache.get();
    if (cached) return cached.manifest;
  }

  // GitHub Raw loading...
  for (const basePath of CONFIG.basePaths) {
    // ... existing code
  }
}

// After: API-first with fallback
async function loadManifest(force = false) {
  if (!force) {
    const cached = cache.get();
    if (cached) return cached.manifest;
  }

  // ✨ NEW: Optional API-first load
  if (useAPI) {
    try {
      const apiRes = await fetch('/api/v1/manifests/TYPE', { 
        cache: 'no-store' 
      });
      if (!apiRes.ok) throw new Error(`API HTTP ${apiRes.status}`);
      const apiJson = await apiRes.json();
      const m = apiJson && apiJson.data ? apiJson.data : null;
      
      // ⚠️ Validate expected data shape
      if (!m || !Array.isArray(m.EXPECTED_ARRAY)) {
        throw new Error('Invalid API manifest shape');
      }
      
      cache.set({ manifest: m, basePath: CONFIG.basePaths[0] });
      log('Manifest loaded from API');
      return m;
    } catch (err) {
      log('API load failed, falling back:', err?.message);
    }
  }

  // Existing GitHub Raw fallback (unchanged)
  for (const basePath of CONFIG.basePaths) {
    // ... existing code
  }
}
```

---

## 4️⃣ Update Version & Docs

### Version Number
- Concert: v4.7.0 → v4.7.1
- Events: v2.6.0 → v2.7.0
- Portrait: v1.0 → v1.1
- etc.

### CHANGELOG.md
```markdown
## vX.X — 2025-11-23 (Optional API)
### API-first with graceful fallback
- **NEW**: Optional API loading via `data-api="on"`
- **ENDPOINT**: `/api/v1/manifests/TYPE`
- **FALLBACK**: GitHub Raw on error
- **NO CHANGE**: Layout, performance, features unchanged
```

### README.md
```markdown
**Current Version: vX.X** — Adds optional API support...

### Optional API loading — vX.X
- Set `data-api="on"` to fetch from `/api/v1/manifests/TYPE`
- Falls back to GitHub Raw if unavailable
- Works with dev proxy: `npm run dev:with-api`
```

---

## 5️⃣ Manifest Type → Endpoint Mapping

| Widget | TYPE | Expected Array | Endpoint |
|--------|------|----------------|----------|
| Concert | `concert` | `manifest.bands` | `/api/v1/manifests/concert` |
| Events | `events` | `manifest.events` | `/api/v1/manifests/events` |
| Journalism | `journalism` | `manifest.albums` | `/api/v1/manifests/journalism` |
| Portrait | `portrait` | `manifest.collections` | `/api/v1/manifests/portrait` |
| Nature | `nature` | `manifest.collections` | `/api/v1/manifests/nature` |
| Featured | `featured` | `manifest.items` | `/api/v1/manifests/featured` |

---

## 6️⃣ Test Checklist

```bash
# 1. Start dev with API
npm run dev:with-api

# 2. Enable API in widget
# Set data-api="on" in HTML

# 3. Load page, check console
# Should see: "Manifest loaded from API"

# 4. Test fallback
# Stop API server (Ctrl+C)
# Reload page
# Should see: "API load failed, falling back"
# Widget still works using GitHub Raw

# 5. Verify no visual changes
# Compare with previous version
# Should be identical behavior
```

---

## 7️⃣ Common Gotchas

❌ **Wrong**: Direct manifest access
```javascript
const data = await fetch('/api/v1/manifests/concert');
const manifest = data; // Missing .data!
```

✅ **Correct**: Access via .data
```javascript
const response = await fetch('/api/v1/manifests/concert');
const json = await response.json();
const manifest = json.data; // ✓
```

---

❌ **Wrong**: Assuming array name
```javascript
if (!m.bands) throw... // Might be .events or .albums!
```

✅ **Correct**: Check actual array name
```javascript
// Concert: m.bands
// Events: m.events  
// Journalism: m.albums
// Portrait/Nature: m.collections
// Featured: m.items
```

---

❌ **Wrong**: Breaking existing fallback
```javascript
if (useAPI) {
  return await loadFromAPI(); // Falls through if error!
}
// GitHub fallback never reached
```

✅ **Correct**: Try/catch with fallthrough
```javascript
if (useAPI) {
  try {
    return await loadFromAPI();
  } catch (err) {
    log('Falling back:', err.message);
    // Continue to GitHub fallback below
  }
}
// GitHub fallback here
```

---

## 8️⃣ Example: Complete Migration

See working example:
- **File**: `src/widgets/concert-portfolio/versions/v4.7.1-api-optional.html`
- **Lines**: Search for `useAPI` and `loadManifest`
- **Pattern**: Copy and adapt for your widget

---

## 🎯 That's It!

**5 steps. 30 minutes. Full API support with graceful fallback.**

Need help? See:
- Full guide: `docs/integrations/api-integration-guide.md`
- Quick ref: `docs/integrations/API-QUICKREF.md`
- API docs: `src/api/README.md`
