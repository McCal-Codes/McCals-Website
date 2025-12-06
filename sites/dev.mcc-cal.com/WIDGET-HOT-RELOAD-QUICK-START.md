# Widget Hot Reload - Quick Reference Card

## 🚀 Get Started (2 minutes)

```bash
# 1. Start the dev site
cd sites/dev.mcc-cal.com
npm run dev
# Opens http://localhost:3000

# 2. Open a widget page (e.g., concerts)
# http://localhost:3000/concerts

# 3. Edit a widget
# src/widgets/concert-portfolio/versions/v4.7.1-api-optional.html

# 4. Reload the widget - Pick ONE:
# Option A: Press Ctrl+Shift+W (fastest)
# Option B: Click "🔄 Widget Reloader" button (top-right)
# Option C: Press F5 for full page refresh
```

## 📋 How It Works

| Mode | URL | Source | Caching |
|------|-----|--------|---------|
| **Development** | `http://localhost:3000` | Local filesystem | None (picks up changes instantly) |
| **Production** | `https://mcc-cal.com` | GitHub raw content | Yes (stable versions) |

## 🎯 Typical Workflow

```
1. Start dev site (npm run dev)
2. Open http://localhost:3000/concerts
3. Edit: src/widgets/concert-portfolio/versions/v4.7.1-api-optional.html
4. Save file
5. Press Ctrl+Shift+W
6. See changes instantly!
```

## 🔄 Three Ways to Reload

### Option 1: Keyboard Shortcut (Fastest ⚡)
- **Mac**: `Cmd+Shift+W`
- **Windows/Linux**: `Ctrl+Shift+W`
- Works from any page with a widget
- No UI needed

### Option 2: Click Button (Easiest 🖱️)
- Look for **"🔄 Widget Reloader"** in top-right corner
- Click **"Reload Widget"** button
- Shows reload timestamp
- Dev-only (hides in production)

### Option 3: Full Page Refresh (Traditional 🔃)
- **Mac**: `Cmd+R` or `Cmd+F5`
- **Windows/Linux**: `Ctrl+R` or `F5`
- Full page reload (slower but always works)

## 📁 What Changed

**New Files:**
- ✅ `/api/widgets/[...slug].ts` - API endpoint
- ✅ `utils/widgetHotReload.ts` - Reload utilities
- ✅ `components/widgets/WidgetReloader.tsx` - Optional UI
- ✅ `WIDGET-HOT-RELOAD-GUIDE.md` - Full guide
- ✅ `WIDGET-HOT-RELOAD-IMPLEMENTATION.md` - Technical details

**Updated Files:**
- ✅ `components/widgets/WidgetEmbed.tsx` - Dev/prod routing
- ✅ `pages/journalism.tsx` - Added WidgetReloader
- ✅ `pages/concerts.tsx` - Added WidgetReloader
- ✅ `README.md` - Feature highlights

## ❌ What's NOT Changed

- ✅ Production behavior (unchanged - GitHub URLs)
- ✅ Dependencies (none added)
- ✅ Squarespace widgets (no changes needed)
- ✅ Existing code (backward compatible)

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Widget not found" | Check file path: `src/widgets/[widget]/versions/[version].html` |
| Changes not appearing | Verify you're on `localhost` (not production URL) |
| Keyboard shortcut not working | Try clicking the reload button instead |
| Port 3000 in use | Use different port: `npm run dev -- -p 3001` |
| Can't find WidgetReloader button | Reload the page or check console for errors |

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `WIDGET-HOT-RELOAD-GUIDE.md` | Complete development guide with examples |
| `WIDGET-HOT-RELOAD-IMPLEMENTATION.md` | Technical implementation details |
| `WIDGET-EMBED-GUIDE.md` | How to embed widgets in Squarespace |
| `README.md` | Dev site overview |

## ⚡ Pro Tips

1. **Multi-Monitor Setup**: Editor on left, dev site on right
2. **Keyboard Shortcut**: Fastest reload method (Ctrl/Cmd+Shift+W)
3. **Live Preview**: Keep dev site running while editing
4. **Check Console**: Use browser DevTools for widget errors
5. **Test Production**: Commit changes and test on Squarespace

## 🎓 Widget Development Loop

```
START
  ↓
1. npm run dev (dev site running)
  ↓
2. Open http://localhost:3000/[page]
  ↓
3. Edit widget HTML file
  ↓
4. Press Ctrl+Shift+W (or click reload button)
  ↓
5. See changes instantly ✨
  ↓
6. Satisfied? → Commit to git
  ↓
7. GitHub Actions updates production
  ↓
END
```

## 🔐 Security

- ✅ Path validation prevents directory traversal
- ✅ Only serves files from `src/widgets/` directory
- ✅ Development-only (hidden in production)
- ✅ No new attack surface

## ✅ Tested & Verified

- ✅ API endpoint works on localhost
- ✅ File serving confirmed
- ✅ Security checks validated
- ✅ Cache headers correct
- ✅ Production behavior unchanged

## 🚀 Zero Breaking Changes

- ✅ All existing code works unchanged
- ✅ WidgetReloader is optional
- ✅ Backward compatible with older browsers
- ✅ Production sites unaffected

---

**Need help?** See `WIDGET-HOT-RELOAD-GUIDE.md` for detailed documentation.

**Version:** 1.0.0  
**Date:** December 6, 2025  
**Status:** Production Ready ✅
