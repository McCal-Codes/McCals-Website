# Session Action Plan - October 27, 2025

## 📊 Current State Overview

### ✅ Production-Ready Widgets
1. **Nature Portfolio Widget (v1.7)** - Work in Progress status
   - Location: `src/widgets/nature-portfolio/versions/v1.7-enhanced-display.html`
   - Features: 32 photo display, smart filtering, landscape support
   - **Has auto-manifest**: `npm run manifest:nature` ✓
   - **Issue reported**: Image loading problems

2. **Portrait Portfolio Widget (v1.0)** - Production Ready
   - Location: `src/widgets/portrait-portfolio/versions/v1.0.html`
   - Features: 3:4 aspect ratio, vertical composition focus
   - **Has manifest** but **NO auto-generator** ❌
   - Status: Ready for content addition

3. **Client Carousel Widget (v1.2.3)** - Production Ready
   - Location: `src/widgets/about/client-carousel/client-carousel-squarespace.html`
   - Current: 22 clients with logos
   - **Requested**: Add new clients + white logo CSS filter

---

## 🎯 Priority Tasks

### 1. Fix Nature Widget Image Loading 🔧
**Priority: HIGH**
- **Issue**: Image loading problems reported
- **Current**: v1.7 has basic error handling but may need retry logic
- **Action**: 
  - Add exponential backoff retry mechanism
  - Improve error state visibility
  - Add debug logging for failed loads
  - Test with actual nature manifest

### 2. Create Portrait Manifest Generator 📸
**Priority: HIGH**
- **Current**: Portrait widget exists but no auto-generator
- **Needed**: Script similar to nature manifest generator
- **Action**:
  - Create `scripts/manifest/generate-portrait-manifest.js`
  - Add npm script: `manifest:portrait`
  - Follow structure of nature/concert generators
  - Expected path: `src/images/Portfolios/Portrait/`

### 3. Update Client Carousel - Add Clients & White Logo CSS 🎨
**Priority: MEDIUM**
- **Current**: v1.2.3 with 22 clients
- **Requested Changes**:
  - Add new clients to carousel
  - Update CSS to apply white filter to ALL logos (not just Haven)
  - Keep carousel functionality intact
- **Action**:
  - Add new client entries to clients array
  - Modify CSS to make all logos white/inverted
  - Test carousel animation with new clients
  - Create v1.3.0

### 4. Add New Event Images to Portfolios 📷
**Priority: LOW**
- **Action Required**:
  - User needs to specify which events
  - Which portfolios need updates (Events, Journalism, Nature?)
  - Run appropriate manifest generators after adding images

---

## 📋 Detailed Action Steps

### Task 1: Nature Widget Image Loading Fix

**Files to modify:**
- `src/widgets/nature-portfolio/versions/v1.7-enhanced-display.html` → Create v1.8

**Changes needed:**
1. Add retry logic with exponential backoff
2. Improve error state with "Retry" button
3. Add console logging for debugging
4. Test with actual manifest data

**Testing:**
- Run `npm run manifest:nature` to ensure manifest is current
- Test widget with debug mode: `?debug=true`
- Verify images load correctly
- Check error states

### Task 2: Portrait Manifest Generator

**New file:**
- `scripts/manifest/generate-portrait-manifest.js`

**Structure:**
```javascript
// Similar to nature manifest generator
// Scan src/images/Portfolios/Portrait/
// Generate portrait-manifest.json
// Support collections/sessions structure
```

**Add to package.json:**
```json
"manifest:portrait": "node scripts/manifest/generate-portrait-manifest.js"
```

**Testing:**
- Create sample portrait folder structure
- Run generator
- Verify manifest output
- Test with portrait widget

### Task 3: Client Carousel Updates

**File to modify:**
- `src/widgets/about/client-carousel/client-carousel-squarespace.html` → Create v1.3.0

**Changes:**
1. Add new clients (user to provide names/logos)
2. Update CSS filter to apply to ALL logos:
```css
.ss-client-logo img {
  filter: brightness(0) invert(1) brightness(1.1) contrast(1.1);
}
```
3. Remove Haven-specific class styling
4. Update animation timing for new client count
5. Update CHANGELOG and README

### Task 4: Event Images Addition

**Waiting for user input:**
- Which events?
- Which portfolios?
- Image locations?

**Once specified:**
- Add images to appropriate folders
- Run manifest generators:
  - `npm run manifest:events`
  - `npm run manifest:journalism`
  - `npm run manifest:nature` (if nature events)

---

## 🛠️ Available Tools & Scripts

### Manifest Generators:
- `npm run manifest:generate` - All manifests
- `npm run manifest:nature` - Nature portfolio ✓
- `npm run manifest:events` - Events portfolio ✓
- `npm run manifest:journalism` - Journalism portfolio ✓
- `npm run manifest:portrait` - **TO BE CREATED** ❌

### Development:
- `npm run dev:auto` - Auto-watch manifests
- `npm run watch:nature-manifest` - Watch nature only

### Validation:
- `npm run ai:preflight:short` - Quick validation
- `npm run validate:widgets` - Widget HTML validation

---

## 📝 Next Steps Order

1. ✅ **Create this action plan** (DONE)
2. 🔧 **Fix nature widget image loading** (NEXT)
3. 📸 **Create portrait manifest generator**
4. 🎨 **Update client carousel with white logos**
5. 📷 **Add event images** (waiting for user details)

---

## 💡 Questions for User

1. **Nature Widget**: What specific image loading issues are you seeing? (errors, slow loading, broken images?)
2. **Client Carousel**: What new clients do you want to add? (names and logo URLs/files)
3. **Portrait Widget**: Do you have portrait images ready to add? What's the folder structure?
4. **Event Images**: Which events and which portfolios should they go into?

---

## 📚 Reference Documents

- Widget Standards: `docs/standards/widget-standards.md`
- Widget Reference: `docs/standards/widget-reference.md`
- Workspace Organization: `docs/standards/workspace-organization.md`
- Versioning Guide: `docs/standards/versioning.md`

---

_Last Updated: 2025-10-27_
