# Phase 2: Quick Reference Card

## 🚀 What's New?

### Auto-Detect Latest Version
```tsx
// Before: manual version tracking
<WidgetEmbed widget="concert-portfolio" version="v4.7.1-api-optional.html" />

// After: automatic detection
<WidgetEmbed widget="concert-portfolio" />
```

---

## 📋 Cheat Sheet

### Component Usage
```tsx
// Basic (auto-detect)
<WidgetEmbed widget="concert-portfolio" />

// With category (after reorganization)
<WidgetEmbed widget="concert-portfolio" category="portfolios" />

// Explicit version (when needed)
<WidgetEmbed widget="concert-portfolio" version="v4.7.0.html" />

// All together
<WidgetEmbed 
  widget="concert-portfolio" 
  category="portfolios"
  version="v4.7.0.html"
/>
```

### API Endpoints
```bash
# Auto-detect latest
curl http://localhost:3000/api/widgets/concert-portfolio

# Explicit version
curl http://localhost:3000/api/widgets/concert-portfolio/v4.7.0.html

# With category (after reorganization)
curl http://localhost:3000/api/widgets/portfolios/concert-portfolio
```

---

## 📂 Widget Organization (After Phase 2B)

```
src/widgets/
├── portfolios/
│   ├── concert-portfolio/
│   ├── event-portfolio/
│   ├── featured-portfolio/
│   ├── nature-portfolio/
│   ├── photojournalism-portfolio/
│   ├── portrait-portfolio/
│   └── video-portfolio/
├── _navigation/
│   ├── site-navigation/
│   └── site-footer/
├── _content/
│   ├── about/
│   ├── blog-feed/
│   ├── contact-form/
│   └── ... (6 more)
├── _admin/
└── _archived/
```

---

## ⚡ Common Tasks

### Add a New Widget Version
```bash
# Create new version file
touch src/widgets/concert-portfolio/versions/v4.8.0.html

# Edit and save
# That's it! Auto-detected on refresh
```

### Update Component Reference
```tsx
// OLD: explicit version
<WidgetEmbed widget="about" version="v1.4.0.html" />

// NEW: auto-detect
<WidgetEmbed widget="about" />

// NEW: with category (after Phase 2B)
<WidgetEmbed widget="about" category="_content" />
```

---

## 🔍 Debug Tips

### Check What Version Loaded
```bash
curl -i http://localhost:3000/api/widgets/concert-portfolio
# Look for: X-Widget-Version header
```

### See Available Versions
```bash
# Get error response with list
curl http://localhost:3000/api/widgets/fake-widget
# Response includes: "available": [...]
```

### Verify Widget Structure
```bash
ls src/widgets/concert-portfolio/versions/
# Should show: v4.7.0.html, v4.7.1-api-optional.html, etc.
```

---

## 📚 Files to Read

| File | When | Time |
|------|------|------|
| `PHASE-2-QUICK-START.md` | **Start here** | 5 min |
| `PHASE-2-WIDGET-REORGANIZATION.md` | Before reorganizing | 10 min |
| `docs/integrations/API-ENDPOINT-REFERENCE.md` | Understanding API | 15 min |

---

## ✅ Version Naming Rules

**Good**:
- ✅ `v1.0.0.html`
- ✅ `v1.2.0-feature.html`
- ✅ `v4.7.1-api-optional.html`

**Avoid**:
- ❌ `v1.html` (ambiguous)
- ❌ `concert-v1.html` (not detected)
- ❌ `final.html` (not sortable)

---

## 🎯 Next Steps

### Today (Optional)
Remove explicit version from a few components → Test

### Soon (1-2 hours)
Follow `PHASE-2-WIDGET-REORGANIZATION.md` → Reorganize widgets

### Result
Cleaner code + Better organized widgets + Automatic version detection 🎉

---

## 💬 Quick Answers

**Q: Do I have to use auto-detect?**  
A: No, explicit versions still work. Auto-detect is optional and backward compatible.

**Q: What if I add v4.8.0.html?**  
A: It's automatically detected as the latest. Refresh browser to see it.

**Q: Can I go back to v4.7.0?**  
A: Sure: `<WidgetEmbed widget="concert-portfolio" version="v4.7.0.html" />`

**Q: When should I reorganize?**  
A: Whenever you have 1-2 hours. Low risk. Follow the guide.

**Q: What happens to GitHub production?**  
A: Nothing. Still uses GitHub raw URLs. Same behavior.

---

**Status**: ✅ Ready to use  
**Backward Compatible**: ✅ Yes  
**Risk**: ✅ None  
**Time to Deploy**: ⏱️ Your choice
