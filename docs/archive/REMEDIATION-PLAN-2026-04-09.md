# Remediation Plan - McCal Media Website

**Date:** April 9, 2026  
**Priority:** Critical issues first, then high priority  
**Goal:** Fix all audit findings efficiently and effectively

---

## Phase 1: Critical Hotfixes (Deploy First)

### 1.1 Fix TypeScript Build Error
**File:** `sites/mcc-cal-vite/src/components/HeroCarousel.tsx`  
**Issue:** `randomizeLink` undefined reference at lines 254, 256  
**Effort:** 15 minutes  
**Risk:** Low

**Root Cause:** The `randomizeLink` callback is defined at line 242, but the TypeScript compiler is reporting it as undefined at lines 254 and 256. This is likely a stale build cache or the function needs to be hoisted.

**Fix:**
```tsx
// Verify the function exists before line 254
// Line 242: const randomizeLink = useCallback((slideIndex: number) => {
// Line 286: randomizeLink(safe);
// Line 288: [slides.length, setTrack, randomizeLink]

// The issue is likely line 256 in the original file had different content.
// Check if the file has been modified and the reference is stale.
```

**Verification:**
```bash
cd sites/mcc-cal-vite
npm run build
```

---

### 1.2 Add XSS Protection to WidgetEmbed
**File:** `sites/mcc-cal-vite/src/components/widgets/WidgetEmbed.tsx`  
**Issue:** `innerHTML` injection without sanitization  
**Effort:** 30 minutes  
**Risk:** High (security vulnerability)

**Implementation:**
1. Install DOMPurify:
   ```bash
   cd sites/mcc-cal-vite
   npm install dompurify
   npm install --save-dev @types/dompurify
   ```

2. Update WidgetEmbed.tsx:
   ```tsx
   import DOMPurify from 'dompurify';
   
   // In the fetch .then() block:
   .then((html) => {
     if (containerRef.current) {
       // Sanitize HTML before injection
       const clean = DOMPurify.sanitize(html, {
         ALLOWED_TAGS: ['div', 'span', 'img', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                       'ul', 'ol', 'li', 'br', 'hr', 'strong', 'em', 'button', 'form', 
                       'input', 'label', 'textarea', 'select', 'option'],
         ALLOWED_ATTR: ['class', 'id', 'src', 'alt', 'href', 'title', 'type', 'name', 
                       'value', 'placeholder', 'for', 'checked', 'selected', 'disabled',
                       'width', 'height', 'style', 'target', 'rel']
       });
       containerRef.current.innerHTML = clean;
       
       // Scripts are already removed by DOMPurify by default
       // This is actually SAFER - no script execution
     }
   })
   ```

**Alternative (If widgets need scripts):**
```tsx
// If widgets absolutely need scripts, use a stricter approach:
const clean = DOMPurify.sanitize(html, {
  ALLOWED_TAGS: [...all needed tags..., 'script'],
  ALLOWED_ATTR: [...all attrs..., 'src'],
  // Add hook to validate script sources
});

// Then manually handle only known-safe scripts
```

**Note:** Widgets being deprecated, so strict sanitization is acceptable.

---

## Phase 2: Widget Migration (High Priority)

### 2.1 Migrate Nature Page (Easy Win)
**File:** `sites/mcc-cal-vite/src/pages/nature.tsx`  
**Pattern:** Follow `concerts.tsx` implementation  
**Effort:** 2 hours  
**Depends on:** Phase 1.2 (if XSS fix affects widget loading)

**Migration Steps:**
1. Check manifest structure:
   ```bash
   cat src/data/nature-manifest.json | head -50
   ```

2. Create adapter function (similar to `adaptConcerts`):
   ```tsx
   interface NatureItem {
     eventName: string;
     relativeFolderPath: string;
     dateDisplay?: string;
     totalImages: number;
     images: string[];
   }
   
   interface NatureManifest {
     nature: NatureItem[]; // or items: NatureItem[]
   }
   
   function adaptNature(manifest: NatureManifest): PortfolioGroup[] {
     const items = manifest.nature || manifest.items || [];
     return items.map((item) => {
       const images = item.images.map((filename) => ({
         url: imageUrl.nature(item.relativeFolderPath, filename),
         filename,
         alt: `${item.eventName} nature photo`,
       }));
       
       return {
         id: item.relativeFolderPath.replace(/\//g, '-'),
         title: item.eventName,
         dateDisplay: item.dateDisplay,
         category: 'Nature',
         images,
         coverImage: images[0],
       };
     });
   }
   ```

3. Update page component:
   ```tsx
   export default function NaturePage() {
     const { data, status, error } = useManifest<NatureManifest>('nature');
     const groups = useMemo(() => data ? adaptNature(data) : [], [data]);
     
     // Same pattern as concerts.tsx for loading/error/success states
   }
   ```

4. Add `imageUrl.nature` helper if not exists:
   ```tsx
   // In imageUrl utility
   nature: (folder: string, filename: string) => 
     `/src/images/Portfolios/Nature/${folder}/${filename}`,
   ```

**Verification:**
- Navigate to `/nature`
- Verify images load
- Verify lightbox works
- Verify filters work (if applicable)

---

### 2.2 Migrate Portraits Page
**File:** `sites/mcc-cal-vite/src/pages/portraits.tsx`  
**Pattern:** Same as Nature  
**Effort:** 2 hours  
**Depends on:** Phase 2.1 (reuse patterns)

**Steps:** Same as Nature, adjust for:
- `portrait-manifest.json`
- `imageUrl.portrait()`
- Category: 'Portraits'

---

### 2.3 Migrate Contact Page (Custom Form)
**File:** `sites/mcc-cal-vite/src/pages/contact-us.tsx`  
**Complexity:** HIGH - Widget contains custom form logic  
**Effort:** 4-6 hours  
**Depends on:** Understanding current widget functionality

**Investigation Steps:**
1. Examine current widget HTML:
   ```bash
   cat src/widgets/_content/contact-us/versions/contact-us.html | head -100
   ```

2. Identify form fields and validation
3. Identify submission endpoint
4. Rebuild as React component with:
   - Form state management
   - Client-side validation
   - API submission
   - Success/error states

**Alternative (Short-term):** Keep using WidgetEmbed with DOMPurify until full migration.

---

## Phase 3: Code Quality Improvements

### 3.1 Fix Remaining ESLint Warnings
**Effort:** 30 minutes  
**Files:**
- `sites/mcc-cal-vite/scripts/generate-favicons.js:89`
- `sites/mcc-cal-vite/scripts/validate-manifests.js:19`

**Fix:** Remove unused variables or prefix with `_`:
```js
// Change:
const icoBuffers = something;
// To:
const _icoBuffers = something; // eslint-disable-line no-unused-vars
// Or remove if truly unused
```

---

### 3.2 Add Error Boundaries
**Effort:** 2 hours  
**Benefit:** Better UX when components crash

**Implementation:**
1. Create `ErrorBoundary.tsx` (if not exists):
   ```tsx
   import { Component, ReactNode } from 'react';
   
   interface Props {
     children: ReactNode;
     fallback?: ReactNode;
   }
   
   interface State {
     hasError: boolean;
     error?: Error;
   }
   
   export class ErrorBoundary extends Component<Props, State> {
     state: State = { hasError: false };
     
     static getDerivedStateFromError(error: Error): State {
       return { hasError: true, error };
     }
     
     componentDidCatch(error: Error, info: React.ErrorInfo) {
       console.error('ErrorBoundary caught:', error, info);
     }
     
     render() {
       if (this.state.hasError) {
         return this.props.fallback || (
           <div className="error-fallback">
             <h2>Something went wrong</h2>
             <button onClick={() => this.setState({ hasError: false })}>
               Try again
             </button>
           </div>
         );
       }
       
       return this.props.children;
     }
   }
   ```

2. Wrap main content in Layout or App.tsx:
   ```tsx
   <ErrorBoundary>
     <Router>
       <Routes>...</Routes>
     </Router>
   </ErrorBoundary>
   ```

---

## Phase 4: Performance Optimizations

### 4.1 Add Suspense Boundaries
**Effort:** 1 hour  
**Benefit:** Better loading UX

**Implementation:**
1. Wrap lazy-loaded components:
   ```tsx
   import { Suspense, lazy } from 'react';
   
   const PortfolioLightbox = lazy(() => 
     import('@/components/portfolio/PortfolioLightbox')
   );
   
   // In JSX:
   <Suspense fallback={<div>Loading lightbox...</div>}>
     <PortfolioLightbox group={activeGroup} onClose={handleClose} />
   </Suspense>
   ```

---

### 4.2 Add Preload for Critical Resources
**Effort:** 30 minutes  
**Benefit:** Faster perceived load time

**Implementation:**
```tsx
// In index.html or usePageMeta
<link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/src/images/Portfolios/featured/cover.jpg" as="image">
```

---

## Execution Schedule

| Phase | Task | Effort | Order | Can Parallel |
|-------|------|--------|-------|--------------|
| 1.1 | Fix TypeScript error | 15 min | 1st | No |
| 1.2 | Add DOMPurify | 30 min | 2nd | No |
| 2.1 | Migrate Nature | 2 hrs | 3rd | No |
| 2.2 | Migrate Portraits | 2 hrs | 4th | No |
| 2.3 | Migrate Contact | 4-6 hrs | 5th | No |
| 3.1 | Fix ESLint | 30 min | Any | Yes |
| 3.2 | Error Boundaries | 2 hrs | 6th | Yes |
| 4.1 | Suspense | 1 hr | 7th | Yes |
| 4.2 | Preload | 30 min | 8th | Yes |

**Total Critical Time:** ~4 hours (Phases 1-2.2)  
**Total Completion Time:** ~12 hours (All phases)

---

## Testing Checklist

### After Each Phase:
- [ ] `npm run build` passes
- [ ] `npm run lint` has 0 errors
- [ ] `npm run test` passes (if tests exist)
- [ ] Manual test: Home page loads
- [ ] Manual test: Portfolio pages load
- [ ] Manual test: Lightbox opens/closes
- [ ] Manual test: Keyboard navigation works

### After Widget Migration:
- [ ] Migrated page loads without errors
- [ ] Images display correctly
- [ ] Lightbox works for all images
- [ ] Mobile responsive
- [ ] SEO meta tags present

---

## Rollback Plan

If issues arise during migration:

1. **Keep original widget files** until migration is verified
2. **Branch per page** (e.g., `feature/migrate-nature-page`)
3. **Quick rollback:**
   ```bash
   git checkout main -- src/pages/nature.tsx
   git checkout main -- src/data/nature-manifest.json
   ```

---

## Dependencies

```bash
# Phase 1.2
npm install dompurify
npm install --save-dev @types/dompurify

# Phase 4 (optional)
npm install react-error-boundary  # Or use custom implementation
```

---

## Success Metrics

- ✅ Build passes (`npm run build` exit code 0)
- ✅ 0 lint errors (`npm run lint`)
- ✅ Nature page uses React (no WidgetEmbed)
- ✅ Portraits page uses React (no WidgetEmbed)
- ✅ DOMPurify installed and configured
- ✅ No console errors on portfolio pages

---

*Plan created: April 9, 2026*  
*Based on: COMPREHENSIVE-AUDIT-REPORT-2026-04-09.md*
