# Additional Improvements Roadmap

This document outlines plans for 5 additional improvements:
1. Structured Data (JSON-LD) Expansion
2. CDN Integration Strategy
3. Image Optimization (WebP)
4. Testing (Playwright E2E)
5. Knowledge Graph Expansion

---

## 1. Structured Data (JSON-LD) Expansion

**Status**: Partial ✅ - Basic support exists via `usePageMeta`

### Current State
- `usePageMeta` hook supports `jsonLd` prop
- Some pages have basic JSON-LD (Blog, About, etc.)
- Inconsistent coverage across pages

### Gap Analysis

| Page Type | Current | Target Schema | Priority |
|-----------|---------|---------------|----------|
| Home | Basic | WebSite + Person | High |
| Portfolio (Concert/Event) | None | ImageGallery + Event | High |
| Individual Portfolio | None | ImageObject + CreativeWork | High |
| About | Basic | Person (expanded) | Medium |
| Blog Index | ✅ | Blog | Done |
| Blog Post | ✅ | Article | Done |
| Contact | None | ContactPage | Low |
| Services | None | Service | Medium |

### Implementation Plan

#### Phase 1: Portfolio Schemas (Week 1)
```typescript
// utils/jsonLd.ts - New utility

/**
 * Generate ImageGallery schema for portfolio pages
 */
export function generateImageGallerySchema(
  title: string,
  images: PortfolioImage[],
  url: string,
  dateCreated?: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: title,
    url,
    dateCreated,
    image: images.map(img => ({
      '@type': 'ImageObject',
      contentUrl: img.url,
      name: img.alt || img.filename,
      description: img.caption,
    })),
  };
}

/**
 * Generate Person schema for photographers
 */
export function generatePersonSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Caleb McCartney',
    jobTitle: 'Photojournalist and Event Photographer',
    url: 'https://mcc-cal.com/about',
    sameAs: [
      'https://instagram.com/mccal_media',
      'https://linkedin.com/in/calebmccartney',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'McCal Media',
    },
  };
}

/**
 * Generate WebSite schema with search
 */
export function generateWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'McCal Media',
    url: 'https://mcc-cal.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://mcc-cal.com/blog?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}
```

#### Phase 2: Page Implementation (Week 2)
Update each page to include comprehensive JSON-LD:

```typescript
// concerts.tsx example
usePageMeta({
  title: 'Concert Photography | Caleb McCartney',
  description: '...',
  canonical: `${SITE_URL}/concerts`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      generateWebSiteSchema(),
      generatePersonSchema(),
      {
        '@type': 'CollectionPage',
        name: 'Concert Photography',
        description: 'Concert and live music photography portfolio',
        url: `${SITE_URL}/concerts`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: groups.map((group, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'ImageGallery',
              name: group.title,
              url: `${SITE_URL}/concerts#${group.id}`,
              image: group.images.map(img => ({
                '@type': 'ImageObject',
                contentUrl: img.url,
                name: img.alt,
              })),
            },
          })),
        },
      },
    ],
  },
});
```

### Success Criteria
- [ ] Every page has appropriate JSON-LD
- [ ] Portfolio pages use ImageGallery schema
- [ ] Homepage has WebSite + Person schema
- [ ] Blog uses Article schema correctly
- [ ] Validate with Google's Rich Results Test

---

## 2. CDN Integration Strategy

**Status**: ✅ Cloudflare Worker configured

### Current State
- Cloudflare Worker at `tools/cloudflare/worker.js`
- Functions: Manifest serving, blog auth, webhooks, rate limiting
- Uses jsDelivr as CDN for images: `https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@main`

### Recommendation: **Keep Cloudflare + Add Image Optimization**

Cloudflare is excellent for this use case:
- **Free tier** generous for portfolio site
- **Edge caching** for manifests (30min TTL already configured)
- **DDoS protection** built-in
- **Workers** for API logic (already implemented)
- **Image optimization** available with Polish (Pro plan)

### Enhancement Plan

#### Option A: Stay on Cloudflare (Recommended)
```javascript
// Add to worker.js - Image optimization headers
// Cloudflare Polish will handle WebP/AVIF conversion

// Add image optimization route
if (url.pathname.startsWith('/images/')) {
  const imageUrl = new URL(request.url);
  
  // Add polish headers for automatic WebP/AVIF
  const modifiedRequest = new Request(imageUrl, {
    headers: {
      ...request.headers,
      'Accept': request.headers.get('Accept') || '',
    },
  });
  
  const response = await fetch(modifiedRequest);
  
  // Clone and add cache headers
  const modified = new Response(response.body, response);
  modified.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  
  return modified;
}
```

**Pros**:
- No migration needed
- Polish automatic format negotiation
- Existing auth/JWT logic stays
- Familiar deployment (wrangler)

**Cons**:
- Polish requires Pro plan ($20/mo)
- Less control than self-hosted

#### Option B: Move to Vercel Edge + R2
If you want more control:

```typescript
// vercel-edge-function.ts
export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  // Similar logic to Cloudflare worker
  // Use R2 for object storage
  // Sharp for image processing (if using Node runtime)
}
```

**Pros**:
- Same platform as deployments
- R2 cheaper than S3
- Can use Sharp for advanced transforms

**Cons**:
- Migration work
- Need to port JWT/auth logic
- Learning curve

### Decision Matrix

| Factor | Cloudflare | Vercel + R2 |
|--------|------------|-------------|
| Migration Effort | None | High |
| Cost (current traffic) | Free | Free tier |
| Image optimization | Polish Pro ($20) | Sharp (free) |
| Edge locations | 300+ | 100+ |
| Auth/JWT | ✅ Working | Needs porting |
| Familiarity | ✅ Yes | Learning |

### Recommendation
**Stay on Cloudflare** - The juice isn't worth the squeeze for migration. Instead:

1. Keep Cloudflare Worker for API/auth
2. Add Cloudflare Images (if needed) or use Polish Pro
3. Use existing jsDelivr for static assets (free, fast)
4. Add image format negotiation in build step (WebP generation)

---

## 3. Image Optimization (WebP Expansion)

**Status**: ❌ Currently serving mostly JPG - WebP limited

### Current State
- Images served as JPG from GitHub/jsDelivr
- No format negotiation
- No responsive sizes
- 2,061 images in portfolio

### Target State
- WebP primary format (25-35% smaller)
- JPG fallback for older browsers
- Responsive srcset for different sizes
- Lazy loading (already done ✅)

### Implementation Plan

#### Phase 1: Build-Time WebP Generation (Week 1)
```javascript
// scripts/optimize-images.js - New build script

import { glob } from 'glob';
import sharp from 'sharp';
import path from 'path';

const PORTFOLIOS_DIR = 'src/images/Portfolios';
const QUALITY = 85;

async function optimizeImages() {
  const images = await glob(`${PORTFOLIOS_DIR}/**/*.{jpg,jpeg,png}`);
  
  for (const imagePath of images) {
    const basePath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
    
    // Generate WebP version
    await sharp(imagePath)
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(`${basePath}.webp`);
    
    // Generate responsive sizes for critical images
    // (cover images, hero images)
    const filename = path.basename(imagePath);
    if (isCoverImage(filename)) {
      for (const width of [400, 800, 1200]) {
        await sharp(imagePath)
          .resize(width, null, { withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(`${basePath}-${width}.webp`);
      }
    }
  }
}
```

#### Phase 2: Component Update (Week 2)
```typescript
// components/Image.tsx - New optimized image component

interface OptimizedImageProps {
  src: string;  // Base path without extension
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes = '100vw',
  priority = false,
}: OptimizedImageProps) {
  // Build srcset for responsive images
  const srcset = [400, 800, 1200, 1600]
    .map(w => `${src}-${w}.webp ${w}w`)
    .join(', ');
  
  return (
    <picture>
      {/* WebP sources */}
      <source
        type="image/webp"
        srcSet={srcset}
        sizes={sizes}
      />
      {/* Fallback JPG */}
      <img
        src={`${src}.jpg`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  );
}
```

#### Phase 3: URL Builder Update
```typescript
// useManifest.ts - Update imageUrl helpers

export const imageUrl = {
  concert(folderPath: string, filename: string, format: 'webp' | 'jpg' = 'webp'): string {
    const baseName = filename.replace(/\.(jpg|jpeg|png)$/i, '');
    const ext = format === 'webp' ? '.webp' : '.jpg';
    const path = `${PORTFOLIOS_BASE}/${folderPath}/${baseName}${ext}`;
    return IS_DEV ? toLocalUrl(path) : toGithubUrl(path);
  },
  // ... other helpers with format param
};
```

### Build Script Integration
```json
// package.json
{
  "scripts": {
    "prebuild": "npm run optimize-images && npm run validate:manifests && node scripts/sync-manifests.js",
    "optimize-images": "node scripts/optimize-images.js",
    "optimize-images:dry": "node scripts/optimize-images.js --dry-run"
  }
}
```

### Expected Savings
| Format | Avg Size | Savings |
|--------|----------|---------|
| JPG (current) | 850 KB | Baseline |
| WebP | 550 KB | ~35% |
| WebP + responsive | 400 KB (mobile) | ~53% |

---

## 4. Testing: Playwright E2E

**Status**: ✅ RTL configured, ❌ Playwright needed

### Why Playwright
- **E2E coverage** for critical user flows
- **Visual regression** testing
- **Cross-browser** testing (Chrome, Firefox, Safari)
- **Mobile** viewport testing
- **Screenshot** comparison for UI changes

### Implementation Plan

#### Phase 1: Setup (Day 1)
```bash
# Install Playwright
cd sites/mcc-cal-vite
npm install -D @playwright/test
npx playwright install

# Create config
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Phase 2: Critical Path Tests (Week 1)
```typescript
// e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads and shows portfolio grid', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Caleb McCartney/);
    await expect(page.locator('.pf-grid')).toBeVisible();
  });

  test('portfolio filtering works', async ({ page }) => {
    await page.goto('/concerts');
    await page.click('.pf-filter-btn:has-text("2024")');
    await expect(page.locator('.pf-card')).toHaveCount(4);
  });

  test('lightbox opens on card click', async ({ page }) => {
    await page.goto('/concerts');
    await page.click('.pf-card:first-child');
    await expect(page.locator('.pf-lightbox')).toBeVisible();
  });
});

// e2e/seo.spec.ts
test.describe('SEO', () => {
  test('JSON-LD is present on portfolio pages', async ({ page }) => {
    await page.goto('/concerts');
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toContain('ImageGallery');
  });

  test('meta tags are correct', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Pittsburgh-based photojournalist/
    );
  });
});

// e2e/accessibility.spec.ts
test.describe('Accessibility', () => {
  test('portfolio cards are keyboard navigable', async ({ page }) => {
    await page.goto('/concerts');
    await page.keyboard.press('Tab');
    await expect(page.locator('.pf-card:focus')).toBeVisible();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/concerts');
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });
});
```

#### Phase 3: Visual Regression (Week 2)
```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
    });
  });

  test('portfolio grid matches snapshot', async ({ page }) => {
    await page.goto('/concerts');
    await page.waitForSelector('.pf-card');
    await expect(page.locator('.pf-grid')).toHaveScreenshot('portfolio-grid.png');
  });
});
```

#### Phase 4: CI Integration (Week 2)
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Test Scripts
```json
// package.json additions
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 5. Knowledge Graph Expansion

**Status**: ✅ Basic entities/relations exist - Need full component mapping

### Current State
- 9 entities (Header, PortfolioGallery, Footer, manifests, deployment targets)
- 12 relations (reads, aggregates, navigates_to, deploys)

### Target State
Complete component dependency graph:
- All React components
- All hooks and utilities
- Data flows
- Page compositions

### Expansion Plan

#### Phase 1: Component Inventory
```typescript
// Entity types to add:
// - ReactComponent (all .tsx files in components/)
// - Hook (all use*.ts files)
// - Utility (lib/, utils/)
// - Page (pages/*.tsx)
// - Style (CSS modules, global CSS)
// - Manifest (all JSON manifests)
// - Type (TypeScript interfaces)
```

#### Phase 2: Relation Types
```typescript
// Relation types to add:
// - imports (component A imports component B)
// - renders (component renders child)
// - uses_hook (component uses hook)
// - provides_data (hook provides data to component)
// - styled_by (component uses styles)
// - routes_to (page routes to other page)
// - depends_on (utility depends on other utility)
```

#### Phase 3: MCP Memory Update
```bash
# Using MCP memory tools to expand graph
mcp10_create_entities for all components
mcp10_create_relations for all imports
```

### Example Expanded Entities
```json
{
  "entities": [
    {
      "name": "PortfolioCard",
      "entityType": "ReactComponent",
      "observations": [
        "Displays single portfolio group",
        "Has lazy loading via IntersectionObserver",
        "Keyboard accessible (Enter/Space)",
        "Located in src/components/portfolio/PortfolioCard.tsx",
        "Props: group, onOpen, onCopyLink",
        "Uses portfolio.css module"
      ]
    },
    {
      "name": "useManifest",
      "entityType": "Hook",
      "observations": [
        "Fetches JSON manifests from CDN",
        "Implements caching with 30min TTL",
        "Returns UseManifestResult with data/status/error",
        "Supports multiple manifest types",
        "Exports imageUrl builders"
      ]
    },
    {
      "name": "imageUrl",
      "entityType": "Utility",
      "observations": [
        "Object with URL builder functions",
        "Methods: journalism(), concert(), events(), portrait(), nature(), featured()",
        "Uses jsDelivr CDN in production",
        "Uses local paths in development",
        "Located in useManifest.ts"
      ]
    }
  ],
  "relations": [
    {
      "from": "PortfolioCard",
      "to": "PortfolioGroup",
      "relationType": "receives_props"
    },
    {
      "from": "PortfolioGrid",
      "to": "PortfolioCard",
      "relationType": "renders"
    },
    {
      "from": "PortfolioGrid",
      "to": "useManifest",
      "relationType": "uses_hook"
    },
    {
      "from": "useManifest",
      "to": "imageUrl",
      "relationType": "exports"
    }
  ]
}
```

---

## Implementation Priority

### Immediate (This Week)
1. **JSON-LD Expansion** - High SEO impact, low effort
2. **Playwright Setup** - Critical for regression prevention

### Short-term (This Month)
3. **WebP Build Script** - Performance improvement
4. **Knowledge Graph** - Documentation completeness

### Ongoing
5. **CDN** - Keep Cloudflare, evaluate Polish Pro when traffic warrants

---

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| JSON-LD Coverage | 40% | 100% |
| E2E Tests | 0 | 20+ |
| Image Format | 100% JPG | 80% WebP |
| Knowledge Graph Entities | 9 | 50+ |
| Knowledge Graph Relations | 12 | 100+ |

---

## Files to Create

### JSON-LD
- `src/utils/jsonLd.ts` - Schema generators
- Update all `src/pages/*.tsx` with full schemas

### CDN
- Keep `tools/cloudflare/worker.js`
- Document decision in ADR

### WebP
- `scripts/optimize-images.js` - Build script
- `src/components/Image.tsx` - Optimized image component
- Update `src/components/portfolio/useManifest.ts` - URL builders

### Testing
- `playwright.config.ts` - Config
- `e2e/navigation.spec.ts` - Tests
- `e2e/seo.spec.ts` - Tests
- `e2e/accessibility.spec.ts` - Tests
- `.github/workflows/playwright.yml` - CI

### Knowledge Graph
- Use MCP tools to expand entities/relations
