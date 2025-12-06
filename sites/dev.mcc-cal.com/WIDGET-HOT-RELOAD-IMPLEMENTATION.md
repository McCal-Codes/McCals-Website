# Widget Hot Reload Implementation Complete ✅

**Date:** December 6, 2025  
**Status:** Production Ready  

## Overview

The dev site now supports **dynamic widget reloading** during development. When you update a widget HTML file in `src/widgets/*/versions/`, the changes appear on the dev site **instantly without requiring a rebuild, commit, or push to GitHub**.

## What Changed

### 1. Enhanced WidgetEmbed Component
**File:** `sites/dev.mcc-cal.com/components/widgets/WidgetEmbed.tsx`

- Detects development vs. production environment
- **Development (`localhost`)**: Loads widgets from local API endpoint
- **Production (deployed)**: Loads widgets from GitHub (existing behavior)
- Disables caching in dev mode to pick up file changes immediately

### 2. New Widget API Endpoint
**File:** `sites/dev.mcc-cal.com/pages/api/widgets/[...slug].ts`

- Catch-all route that serves widget HTML files from the filesystem
- Reads from: `src/widgets/[widget]/versions/[version].html`
- Includes security checks to prevent directory traversal
- Sets appropriate dev-mode headers (no-cache)

### 3. Widget Hot Reload Utilities
**File:** `sites/dev.mcc-cal.com/utils/widgetHotReload.ts`

Provides programmatic interface for reloading widgets:
- `reloadWidget(widget, version, options)` - Reload a specific widget
- `reloadAllWidgets(options)` - Reload all widgets
- `setupWidgetReloadShortcut(widget, version, key)` - Setup keyboard shortcut
- Built-in notification system with animations

### 4. Optional UI Component (WidgetReloader)
**File:** `sites/dev.mcc-cal.com/components/widgets/WidgetReloader.tsx`

Dev-only visual component showing:
- Current widget name and version
- One-click reload button  
- Last reload timestamp
- Keyboard shortcut hint (Ctrl+Shift+W)
- Automatically hidden in production

### 5. Updated Page Examples
**Files:**
- `sites/dev.mcc-cal.com/pages/journalism.tsx`
- `sites/dev.mcc-cal.com/pages/concerts.tsx`

Show how to use the WidgetReloader component (optional).

### 6. Comprehensive Documentation
**Files:**
- `sites/dev.mcc-cal.com/WIDGET-HOT-RELOAD-GUIDE.md` - Complete development guide
- `sites/dev.mcc-cal.com/README.md` - Updated with feature highlights

## How to Use

### Quick Start
1. Start the dev site: `npm run dev` (in `sites/dev.mcc-cal.com/`)
2. Visit `http://localhost:3000`
3. Edit any widget HTML file in `src/widgets/*/versions/`
4. Reload the widget **ONE OF THREE WAYS**:
   - Click the "🔄 Widget Reloader" button (top-right)
   - Press **Ctrl+Shift+W** (Cmd+Shift+W on macOS)
   - Full page refresh (F5 or Cmd+R)

### Example Workflow
```bash
# Terminal 1: Start dev site
cd sites/dev.mcc-cal.com
npm run dev
# Opens http://localhost:3000

# Terminal 2: Edit a widget
# Open: src/widgets/concert-portfolio/versions/v4.7.1-api-optional.html
# Make changes...
# Save file

# Back in Browser:
# Press Ctrl+Shift+W to see changes instantly!
```

## Technical Implementation Details

### Development Mode Detection
```typescript
const isDev = typeof window !== 'undefined' && 
              window.location.hostname === 'localhost';
```

### URL Routing
- **Dev**: `/api/widgets/photojournalism-portfolio/v5.2.0-performance-optimized.html`
- **Prod**: `https://raw.githubusercontent.com/McCal-Codes/.../v5.2.0-performance-optimized.html`

### API Endpoint Features
- **Path Resolution**: Maps relative paths safely using `path.resolve()`
- **Security**: Validates paths stay within `src/widgets/` directory
- **Caching**: Disabled via `Cache-Control: no-store` headers
- **Error Handling**: Returns 404 if widget not found, 403 if path invalid

### Script Re-execution
After injecting HTML, the WidgetEmbed component:
1. Finds all `<script>` tags in the injected HTML
2. Creates new script elements
3. Re-executes inline scripts or loads external ones
4. Appends them to the document body

This ensures widget JavaScript initializes properly.

## Benefits

✅ **Instant Feedback** - See changes as you make them (zero rebuild time)  
✅ **No Breaking Changes** - Production behavior completely unchanged  
✅ **Backward Compatible** - Falls back to GitHub URLs automatically  
✅ **Zero Configuration** - Works out of the box  
✅ **Secure** - API includes path validation and sanitization  
✅ **Developer-Friendly** - Keyboard shortcuts and visual feedback  
✅ **Optional UI** - WidgetReloader component is completely optional  

## Testing Results

✅ **API Endpoint Tested**: Successfully serves widget HTML from filesystem  
✅ **File Access Verified**: Can read and return concert portfolio widget  
✅ **Security Validated**: Path traversal protection working  
✅ **Cache Headers Correct**: dev-mode no-cache headers set properly  

### Test Command
```bash
curl http://localhost:3002/api/widgets/concert-portfolio/v4.7.1-api-optional.html
# Returns: 200 OK with full widget HTML
```

## Backward Compatibility

### Production Mode
- **Zero changes**: Production sites continue loading from GitHub
- **No impact**: Existing Squarespace widgets unaffected
- **Seamless**: WidgetReloader component automatically hides in production

### Existing Code
- All existing widget embeds work without changes
- WidgetReloader is optional (pages without it still work)
- Default behavior unchanged (falls back to GitHub in production)

## Files Modified/Created

```
sites/dev.mcc-cal.com/
├── components/widgets/
│   ├── WidgetEmbed.tsx                 [UPDATED] - Added dev/prod routing
│   └── WidgetReloader.tsx              [NEW] - Optional reload UI
├── pages/api/widgets/
│   └── [...slug].ts                    [NEW] - Catch-all API endpoint
├── pages/
│   ├── journalism.tsx                  [UPDATED] - Added WidgetReloader
│   └── concerts.tsx                    [UPDATED] - Added WidgetReloader
├── utils/
│   ├── widgetHotReload.ts             [NEW] - Reload utilities
│   └── widgetConfig.ts                [UNCHANGED]
├── WIDGET-HOT-RELOAD-GUIDE.md         [NEW] - Development guide
└── README.md                           [UPDATED] - Feature highlights
```

## Troubleshooting

### Widget changes not appearing?
1. Verify you're on `localhost` (not production URL)
2. Check file path: `src/widgets/[widget]/versions/[version].html`
3. Try Ctrl+Shift+W keyboard shortcut
4. Check browser console for errors
5. Try full page refresh (F5)

### API endpoint returning 404?
1. Verify widget file exists at the correct path
2. Check widget folder name (case-sensitive)
3. Check version filename exactly (case-sensitive, includes `.html`)
4. See WIDGET-HOT-RELOAD-GUIDE.md for troubleshooting

### Port already in use?
```bash
# Kill the process using the port
lsof -ti:3000 | xargs kill -9

# Or specify different port
npm run dev -- -p 3001
```

## Next Steps (Optional Enhancements)

- [ ] Add file watcher integration for automatic reload
- [ ] Add browser DevTools integration
- [ ] Add performance metrics display
- [ ] Add reload history/timeline view
- [ ] Add multi-widget reload management
- [ ] Add widget validation before reload

## Documentation

For complete workflow and advanced usage, see:
- **[WIDGET-HOT-RELOAD-GUIDE.md](./WIDGET-HOT-RELOAD-GUIDE.md)** - Full development guide
- **[WIDGET-EMBED-GUIDE.md](./WIDGET-EMBED-GUIDE.md)** - How to embed widgets
- **[README.md](./README.md)** - Dev site overview

## Impact Summary

### For Developers
✅ Faster iteration cycles - no rebuild delays  
✅ Easier debugging - instant visual feedback  
✅ Better workflow - keyboard shortcuts for efficiency  
✅ Optional UI - choose your own reload method  

### For Users/Production
✅ Zero impact - production behavior unchanged  
✅ Seamless - automatic fallback to GitHub URLs  
✅ Reliable - no new dependencies or external services  
✅ Secure - path validation prevents directory traversal  

---

**Implementation Date:** December 6, 2025  
**Status:** ✅ Complete and Tested  
**Breaking Changes:** ❌ None  
**New Dependencies:** ❌ None  

Developers can now see widget changes instantly during development while production behavior remains completely unchanged!
