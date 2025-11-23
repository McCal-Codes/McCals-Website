# API Integration Guide for Portfolio Widgets

## Overview
This guide documents how to add API support to portfolio widgets using the `/api/v1/manifests/*` endpoints.

## Available API Endpoints

The API server provides the following manifest endpoints:

- `/api/v1/manifests/concert` - Concert portfolio data
- `/api/v1/manifests/events` - Events portfolio data  
- `/api/v1/manifests/journalism` - Photojournalism portfolio data
- `/api/v1/manifests/nature` - Nature portfolio data
- `/api/v1/manifests/portrait` - Portrait portfolio data
- `/api/v1/manifests/featured` - Featured works data
- `/api/v1/manifests/universal` - Universal portfolio (all types)

### Response Format

All manifest endpoints return:
```json
{
  "type": "concert",
  "data": { /* manifest content */ },
  "meta": {
    "timestamp": "2025-11-23T...",
    "cached": false
  }
}
```

## Widget Integration Pattern

### Data Attribute Configuration

Add `data-api` attribute to the widget container:

```html
<div id="widgetPf" 
     data-panes="24"
     data-api="off">  <!-- Set to "on" to enable API -->
  <!-- Widget content -->
</div>
```

### JavaScript Integration Pattern

```javascript
// 1. Read configuration
const portfolio = document.getElementById('widgetPf');
const useAPI = portfolio && portfolio.dataset.api === 'on';

// 2. API-first loading with fallback
async function loadManifest(force = false) {
  // Check cache first (unless forced)
  if (!force) {
    const cached = cache.get();
    if (cached) return cached.manifest;
  }

  // Optional API-first load when enabled
  if (useAPI) {
    try {
      const apiRes = await fetch('/api/v1/manifests/TYPE', { cache: 'no-store' });
      if (!apiRes.ok) throw new Error(`API HTTP ${apiRes.status}`);
      const apiJson = await apiRes.json();
      const manifest = apiJson && apiJson.data ? apiJson.data : null;
      if (!manifest || !Array.isArray(manifest.items)) {
        throw new Error('Invalid API manifest shape');
      }
      cache.set({ manifest, basePath: CONFIG.basePaths[0] });
      log('Manifest loaded from API');
      return manifest;
    } catch (err) {
      log('API manifest load failed, falling back to GitHub raw:', err?.message);
    }
  }

  // GitHub Raw fallback
  for (const basePath of CONFIG.basePaths) {
    try {
      const response = await fetch(buildUrls.manifest(basePath), { 
        cache: 'no-store' 
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const manifest = await response.json();
      cache.set({ manifest, basePath });
      log('Manifest loaded from', basePath);
      return manifest;
    } catch (error) {
      log(`Failed to load from ${basePath}:`, error.message);
    }
  }
  throw new Error('Failed to load manifest from all sources');
}
```

## Widgets Supporting API

### ✅ Implemented
- **Concert Portfolio v4.7.1** - Full API support with Spotify integration
  - File: `src/widgets/concert-portfolio/versions/v4.7.1-api-optional.html`
  - Endpoint: `/api/v1/manifests/concert`
  - Data shape: `manifest.data.bands[]`

### 🚧 Ready for Implementation

The following widgets can be easily upgraded with API support using the pattern above:

1. **Event Portfolio**
   - Current: v2.6.0
   - Target: v2.7.0
   - Endpoint: `/api/v1/manifests/events`
   - Data shape: `manifest.events[]`

2. **Portrait Portfolio**
   - Current: v1.0
   - Target: v1.1
   - Endpoint: `/api/v1/manifests/portrait`
   - Data shape: `manifest.collections[]`

3. **Photojournalism Portfolio**
   - Current: v5.2
   - Target: v5.3
   - Endpoint: `/api/v1/manifests/journalism`
   - Data shape: `manifest.albums[]`

4. **Featured Portfolio**
   - Current: v1.5
   - Target: v1.6
   - Endpoint: `/api/v1/manifests/featured`
   - Data shape: `manifest.items[]`

5. **Nature Portfolio**
   - Current: Check versions/
   - Target: Next version
   - Endpoint: `/api/v1/manifests/nature`
   - Data shape: `manifest.collections[]`

## Development Workflow

### Local Testing with API Proxy

1. Start the dev environment with API:
   ```bash
   npm run dev:with-api
   ```

2. This runs:
   - Site dev server on `http://localhost:3000` (with proxy)
   - API server on `http://localhost:3001`

3. The dev server proxies `/api/*` requests to the API server

4. Enable API in widget:
   ```html
   <div id="widgetPf" data-api="on">
   ```

5. Widget will fetch from `/api/v1/manifests/TYPE` (proxied to API server)

### Testing Fallback

1. Stop the API server (Ctrl+C in API terminal)
2. Reload the page
3. Widget should gracefully fall back to GitHub Raw manifest

## Benefits of API Integration

1. **Faster Loading**: In-memory cache reduces manifest fetch time
2. **Reduced GitHub API Pressure**: Fewer raw.githubusercontent.com requests
3. **Flexible Deployment**: Can use local/CDN/custom manifest sources
4. **Better Control**: Caching, rate limiting, and monitoring in one place
5. **Graceful Degradation**: Automatic fallback if API is unavailable

## Cache Configuration

API manifests are cached in memory for 5 minutes by default:

```javascript
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

### Cache Management

- **Clear cache**: `POST /api/v1/manifests/cache/clear`
- **Cache stats**: `GET /api/v1/manifests/cache/stats`
- **List manifests**: `GET /api/v1/manifests`

## Migration Checklist

When adding API support to a widget:

- [ ] Add `data-api` attribute to container
- [ ] Read `useAPI` flag from `dataset.api`
- [ ] Implement API-first load with try/catch
- [ ] Parse `apiJson.data` correctly for widget data shape
- [ ] Keep GitHub Raw fallback intact
- [ ] Update widget version number
- [ ] Add changelog entry documenting API support
- [ ] Update widget README with data-api instructions
- [ ] Test with API enabled
- [ ] Test fallback with API disabled/stopped
- [ ] Verify no performance regression

## Notes

- API support is **optional** and **opt-in** via `data-api="on"`
- Default behavior remains GitHub Raw (backwards compatible)
- No changes required to existing deployments
- API is designed for development and controlled deployments
- Squarespace deployments continue using GitHub Raw by default

## See Also

- API Documentation: `src/api/README.md`
- Concert Portfolio API Example: `src/widgets/concert-portfolio/versions/v4.7.1-api-optional.html`
- Widget Standards: `docs/standards/widget-standards.md`
