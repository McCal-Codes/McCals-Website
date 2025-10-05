# Widget Debugging Lessons - Critical Learning

## Date: October 5, 2025

## Issue: Event Portfolio Widget Repeated Breakages (v2.6.1, v2.6.2, v2.6.3)

### What Keeps Breaking
The event portfolio widget lightbox scrolling functionality has broken **three times in a row** during debugging sessions.

### Root Cause Pattern
**MIXING INCOMPATIBLE PATTERNS** instead of complete, clean copies:

1. **v2.6.0 = WORKS PERFECTLY** ✅
   - Scrollable lightbox gallery
   - Complete `html.lb-open` CSS system
   - Working `openLB()` and `closeLB()` functions
   - Proper event binding

2. **v2.6.1 = BROKEN** ❌
   - Tried to add GitHub-first loading
   - Lost lightbox scroll functionality
   - Mixed old/new patterns

3. **v2.6.2 = BROKEN** ❌
   - Tried to "fix" v2.6.1 
   - Added changelog modal correctly
   - Lost lightbox scroll again
   - Partial CSS/HTML updates

4. **v2.6.3 = BROKEN** ❌
   - Complete rewrite attempt
   - Still broke basic functionality
   - Deleted after failure

### Critical Lesson: STOP MIXING PATTERNS

#### ❌ NEVER DO THIS:
- Copy some CSS but not all
- Update HTML structure without matching JavaScript
- "Upgrade" working code with partial fixes
- Mix function names (`openLightbox` vs `openLB`)

#### ✅ ALWAYS DO THIS:
1. **If v2.6.0 works, COPY IT EXACTLY**
2. **Make ONE change at a time**
3. **Test after each change**
4. **If it breaks, revert immediately**

### The Pattern That Always Works

```javascript
// v2.6.0 working pattern - NEVER change this core:
function openLB(ev){let lb=$('#lightbox'),gal=$('#lbGallery'); /*..exact copy..*/ }
function closeLB(){let lb=$('#lightbox'); /*..exact copy..*/ }
```

```css
/* v2.6.0 working pattern - NEVER change this core: */
.lightbox{position:fixed;inset:0;display:none;/*..exact copy..*/}
.lightbox.is-open{display:flex}
html.lb-open .events-portfolio{pointer-events:none;}
```

```html
<!-- v2.6.0 working pattern - NEVER change this core: -->
<div class="lightbox" id="lightbox" aria-hidden="true">
  <div class="lb-dialog" role="dialog" aria-modal="true" aria-labelledby="lbTitle" tabindex="-1">
    <button class="lb-close" type="button" aria-label="Close">&times;</button>
    <div class="lb-gallery" id="lbGallery"></div>
    <div class="lb-caption">
      <h3 class="lb-title" id="lbTitle"></h3>
      <p class="lb-meta" id="lbMeta"></p>
      <p class="lb-desc" id="lbDesc"></p>
    </div>
  </div>
</div>
```

### Future Widget Work Protocol

1. **Identify the stable, working version** (v2.6.0)
2. **Copy it completely to new version** 
3. **Make exactly ONE change**
4. **Test immediately**
5. **If broken, revert and try different approach**
6. **NEVER mix patterns from broken versions**

### What Works vs What Breaks

#### Works ✅:
- v2.6.0 lightbox system (complete)
- Changelog modal (when added properly)
- GitHub-first manifest loading (when isolated)

#### Always Breaks ❌:
- Partial lightbox updates
- Mixing old/new function names
- Incomplete CSS class updates
- "Upgrading" working patterns

### Emergency Recovery Protocol
When widget breaks:
1. **Immediately copy from last working version** (v2.6.0)
2. **Do NOT attempt to "fix" the broken version**
3. **Start fresh with working foundation**
4. **Add new features ONE AT A TIME**

### Status: Latest Working Version
- **v2.6.0**: Fully functional with scrollable lightbox
- **v2.6.2**: Has changelog modal but lightbox issues
- **Future versions**: Must build from v2.6.0 foundation

### Key Insight
The lightbox system is **extremely fragile** because it involves:
- Complex CSS class interactions (`html.lb-open`)
- Multiple DOM elements in precise hierarchy
- Event binding timing issues
- CSS overflow and pointer-events coordination

**Solution**: Treat lightbox system as **monolithic component** - copy completely or not at all.