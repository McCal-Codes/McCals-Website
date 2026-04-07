# McCal Media Platform - Enhanced Codemap

## New System Traces

### Trace 7: Build/Deploy Pipeline
**Description:** CI/CD pipeline that triggers on git push, generates manifests, builds the site, and deploys to Vercel

```
Build/Deploy Pipeline
├── Git Push Trigger
│   ├── Developer pushes to main <-- 7a
│   └── GitHub Actions workflows activate <-- 7b
├── Manifest Generation (Parallel)
│   ├── concert-manifest.yml <-- 7c
│   ├── events-manifest.yml
│   ├── journalism-manifest.yml
│   └── [portfolio]-manifest.yml workflows
├── Reusable Manifest Job
│   ├── Generate manifest via generate-manifest action <-- 7d
│   ├── Validate JSON with jq <-- 7e
│   ├── Commit manifest to repo <-- 7f
│   └── Notify webhook for cache refresh <-- 7g
├── Publish to CDN
│   ├── Detect manifest changes <-- 7h
│   ├── Create manifests-cdn branch <-- 7i
│   ├── Tag release with timestamp <-- 7j
│   └── Push branch + tag to origin <-- 7k
├── Cache Purge (Conditional)
│   ├── Cloudflare webhook secret check <-- 7l
│   ├── POST to api.mcc-cal.com/webhooks/refresh <-- 7m
│   └── Purge + warm edge cache <-- 7n
└── Vercel Deployment
    ├── Build command: npm run build <-- 7o
    ├── TypeScript compilation <-- 7p
    ├── Vite bundling + optimization <-- 7q
    └── Deploy to Vercel edge network <-- 7r
```

**Location IDs:**
- **7a** Git push to main branch: `.github/workflows/[portfolio]-manifest.yml:5`
- **7b** GitHub Actions trigger: `.github/workflows/[portfolio]-manifest.yml:3-9`
- **7c** Portfolio-specific workflow dispatch: `.github/workflows/concert-manifest.yml:29-34`
- **7d** Generate manifest action: `.github/workflows/reusable-manifest.yml:78-84`
- **7e** JSON validation: `.github/workflows/reusable-manifest.yml:85-89`
- **7f** Commit manifest changes: `.github/workflows/reusable-manifest.yml:90-112`
- **7g** Notify webhook: `.github/workflows/reusable-manifest.yml:114-119`
- **7h** Detect changes in publish-manifests-cdn.yml: `.github/workflows/publish-manifests-cdn.yml:44-51`
- **7i** Create manifests-cdn branch: `.github/workflows/publish-manifests-cdn.yml:53-56`
- **7j** Tag release: `.github/workflows/publish-manifests-cdn.yml:80-93`
- **7k** Push branch and tag: `.github/workflows/publish-manifests-cdn.yml:90-94`
- **7l** Cloudflare secret check: `.github/workflows/publish-manifests-cdn.yml:108-112`
- **7m** POST to refresh endpoint: `.github/workflows/publish-manifests-cdn.yml:117-121`
- **7n** Purge and warm cache: `api.mcc-cal.com/api/v1/webhooks/refresh`
- **7o** Build command execution: `sites/mcc-cal-vite/package.json:11`
- **7p** TypeScript compilation: `sites/mcc-cal-vite/package.json:11` (tsc -b)
- **7q** Vite build process: `sites/mcc-cal-vite/vite.config.ts`
- **7r** Vercel deployment: `vercel.json:3-4`

**Timing:**
- GitHub Actions queue: 0-30s
- Manifest generation: 5-15s per portfolio
- Build (tsc + vite): 30-60s
- Vercel deploy: 15-45s
- **Total pipeline: ~2-3 minutes**

---

### Trace 8: Cache Invalidation & Refresh Flow
**Description:** Multi-layer cache invalidation when manifests change - from local dev to CDN edge

```
Cache Invalidation Flow
├── Source Triggers
│   ├── [A] File watcher detects change <-- 8a
│   ├── [B] MCP edit post completes <-- 8b
│   └── [C] GitHub Actions publishes manifests <-- 8c
├── Local Cache Layer
│   ├── Dev server file cache clear <-- 8d
│   └── Vite HMR (Hot Module Replacement) <-- 8e
├── API Cache Layer
│   ├── Vercel serverless function cache <-- 8f
│   │   └── Cache-Control: s-maxage=3600 <-- api/manifests/[type].js:66
│   ├── Stale-while-revalidate pattern <-- 8g
│   │   ├── Serve stale (24h max) <-- api/manifests/[type].js:66
│   │   └── Revalidate in background <-- 8h
│   └── Manual webhook invalidation <-- 8i
│       └── POST /api/v1/webhooks/invalidate-all
├── CDN/Edge Cache Layer
│   ├── Cloudflare edge purge <-- 8j
│   │   └── Triggered by GitHub Actions webhook
│   ├── Cache warm (pre-fetch) <-- 8k
│   │   └── Hits all manifest endpoints
│   └── jsDelivr CDN refresh <-- 8l
│       └── Uses git tag-based URLs
└── Client Cache Layer
    ├── React Query cache (5 min stale) <-- 8m
    ├── Browser fetch cache
    └── Service worker (if enabled)
```

**Location IDs:**
- **8a** File watcher trigger: `scripts/watchers/watch-auto-manifest.js:172`
- **8b** MCP edit completes: `mcp/tools/blog-content.js:137`
- **8c** GitHub Actions publish: `.github/workflows/publish-manifests-cdn.yml:96-102`
- **8d** Dev server restart: `dev-server.js` (implicit on file change)
- **8e** Vite HMR: `sites/mcc-cal-vite/vite.config.ts` (built-in)
- **8f** Vercel function cache: `sites/mcc-cal-vite/api/manifests/[type].js:66`
- **8g** Stale-while-revalidate header: `sites/mcc-cal-vite/api/manifests/[type].js:66`
- **8h** Background revalidation: Vercel edge behavior
- **8i** Manual invalidation webhook: Referenced in npm script `api:refresh`
- **8j** Cloudflare purge: `.github/workflows/publish-manifests-cdn.yml:103-132`
- **8k** Cache warming: `api.mcc-cal.com/api/v1/webhooks/refresh` (implementation)
- **8l** jsDelivr refresh: `.github/workflows/publish-manifests-cdn.yml:143`
- **8m** React Query config: `sites/mcc-cal-vite/src/hooks/useManifest.ts` (typical pattern)

**Cache Header Strategy:**
```javascript
// api/manifests/[type].js:66
Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400
```
- `max-age=0`: Browser always revalidates
- `s-maxage=3600`: CDN caches for 1 hour
- `stale-while-revalidate=86400`: Serve stale up to 24h while fetching fresh

---

### Trace 9: Widget CDN Delivery Flow
**Description:** How widgets are packaged and served via CDN for external embedding

```
Widget CDN Delivery Pipeline
├── Widget Development
│   ├── Create widget in src/widgets/[category]/ <-- 9a
│   └── Version with semantic versioning (v1, v2) <-- 9b
├── Build Process
│   ├── Widget snippet generation <-- 9c
│   └── Copy to _cdn/snippets/ <-- 9d
├── Distribution
│   ├── jsDelivr CDN serves from GitHub <-- 9e
│   │   └── URL: cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@{tag}/...
│   └── Vercel Edge Function for dynamic widgets <-- 9f
│       └── api/widgets/[...slug].js
└── Consumer Usage
    ├── Copy-paste snippet HTML <-- 9g
    ├── Async script loading <-- 9h
    └── Shadow DOM isolation <-- 9i
```

**Location IDs:**
- **9a** Widget source location: `src/widgets/portfolios/concert-portfolio/v1/`
- **9b** Version directory: Pattern `src/widgets/**/v\d+/`
- **9c** Snippet generation: `scripts/utils/build-site-widgets.js`
- **9d** CDN snippets folder: `src/widgets/_cdn/snippets/`
- **9e** jsDelivr integration: `.github/workflows/publish-manifests-cdn.yml:143`
- **9f** Dynamic widget API: `sites/mcc-cal-vite/api/widgets/[...slug].js`
- **9g** Snippet HTML files: `src/widgets/_cdn/snippets/concert-portfolio.html`
- **9h** Async loading pattern: `<script async src="...">`
- **9i** Shadow DOM usage: Within widget JavaScript implementation

---

## Cross-System Dependencies

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MCCAL MEDIA PLATFORM - SYSTEM MAP                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│   │   SOURCE     │────▶│   MANIFEST   │────▶│     API      │            │
│   │   (Photos)   │     │  GENERATION  │     │   SERVER     │            │
│   └──────────────┘     └──────────────┘     └──────┬───────┘            │
│         │                    │                     │                    │
│         │ [Watcher]          │ [JSON write]        │ [HTTP]             │
│         │                    │                     │                    │
│         ▼                    ▼                     ▼                    │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│   │    IMAGE     │     │    DATA      │     │   VERCEL     │            │
│   │  OPTIMIZER   │────▶│   LAYER      │◀────│   EDGE       │            │
│   └──────────────┘     └──────────────┘     └──────────────┘            │
│          │                   │    ▲              │                     │
│          │                   │    │              │                     │
│          └───────────────────┘    │              │                     │
│                  [sync-manifests] │              │                     │
│                                   │              │                     │
│   ┌──────────────┐               │              │                     │
│   │     MCP      │───────────────┘              │                     │
│   │   SERVER     │     [Edit triggers regen]   │                     │
│   └──────────────┘                               │                     │
│          │                                       │                     │
│          │ [AI Tool Calls]                      │                     │
│          ▼                                       │                     │
│   ┌──────────────┐     ┌──────────────┐         │                     │
│   │   AI/IDE     │     │   GITHUB     │─────────┘                     │
│   │  (Windsurf)  │     │   ACTIONS    │   [Deploy]                    │
│   └──────────────┘     └──────────────┘                             │
│                                                          │                     │
│                                                          ▼                     │
│                                                    ┌──────────────┐            │
│                                                    │  CLOUDFLARE  │            │
│                                                    │     CDN      │            │
│                                                    └──────────────┘            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

LEGEND:
──────▶  Data flow (primary)
- - - ▶  Trigger/Signal flow
[Label]  Connection type
```

**Key Dependency Chains:**

1. **Photo Import → Live Site:**
   ```
   Add Photo → File Watcher → Manifest Gen → Git Push → 
   GitHub Actions → Deploy → CDN Purge → Live
   [~3-5 min total]
   ```

2. **Content Edit (MCP) → Live:**
   ```
   AI Edit Post → Save JSON → File Watcher → Manifest Gen → 
   Git Push → GitHub Actions → Deploy
   [~3-5 min total]
   ```

3. **Widget Update → CDN:**
   ```
   Edit Widget → Build Snippets → Git Push → jsDelivr Refresh
   [~2-3 min total]
   ```

---

## Performance Annotations (Updated Traces)

### Trace 1: Auto-Manifest Generation
```
Timing Breakdown:
├── [1a] File watcher detects new photo          ~2ms
├── [1b] Schedule debounced regeneration          immediate (queue)
├── [1c] Trigger after debounce                   ~2000ms (configurable)
├── [1d] Execute npm manifest script              ~3000-5000ms
│   ├── Process directory (per 100 images)      ~500ms
│   ├── EXIF extraction (per image)               ~50-200ms
│   └── JSON write to disk                        ~50ms
└── Total: ~5-7 seconds for typical concert folder
```

### Trace 2: Portfolio Data API
```
Timing Breakdown:
├── [2a] API handler receives request             ~1ms (Vercel edge)
├── [2b-g] File read + JSON parse + response      ~5-50ms
│   ├── Cold start (initial)                      ~100-300ms
│   └── Warm (cached)                             ~5-10ms
├── [2f] Cache header processing                  ~1ms
└── Total: ~5-300ms depending on cache state
```

### Trace 4: Contact Form Submission
```
Timing Breakdown:
├── [4a] API handler entry                        ~1ms
├── [4b] Rate limiting check (Redis/memory)       ~5-20ms
├── [4c] Honeypot validation                      ~1ms
├── [4d] Field validation                       ~1-5ms
├── [4e] Resend API call                          ~200-800ms
│   └── Network latency to Resend
└── Total: ~250-850ms (mostly external API)
```

### Trace 5: Image Optimization
```
Timing Breakdown:
├── [5a] Optimize function entry per image        ~1ms
├── [5b] Sharp image load                         ~50-200ms
│   └── Depends on file size (MB)
├── [5c] Resize (if >4K)                          ~100-500ms
├── [5d] JPEG compression                         ~200-1000ms
│   └── Quality 80, mozjpeg enabled
└── Total per image: ~500-2000ms
    Batch (100 images): ~60-120 seconds
```

---

## Failure Scenarios & Fallbacks

### Manifest Generation Failures
```
Scenario: EXIF extraction fails
├── Fallback 1: Use filename date pattern
├── Fallback 2: Use file creation timestamp
└── Fallback 3: Set date to null, flag for manual review

Scenario: Manifest write fails
├── Log error to console
├── Retry up to 3 times with exponential backoff
└── Alert via GitHub Actions (if CI context)
```

### API Failures
```
Scenario: Manifest file missing
├── Return 404 with helpful error message
├── Include list of available manifest types
└── Log to error tracking

Scenario: JSON parse error
├── Return 500
├── Log file path for debugging
└── GitHub Actions notification on repeated failures
```

### Cache Refresh Failures
```
Scenario: Cloudflare purge fails
├── Log warning (non-fatal)
├── Cache expires naturally in 1 hour
└── Manual purge available via dashboard

Scenario: Webhook notification fails
├── Retry with exponential backoff
├── Queue for later retry if persistent
└── Log to monitoring
```

---

## Tool Integration Points

### Vercel MCP Integration
```
Entry Points:
├── Deployment Status
│   └── Query: "Show deployment status for mcc-cal-vite"
│   └── Tool: vercel.getDeployments()
│   └── Trace: [7r] Deploy status check
├── Log Analysis
│   └── Query: "Check error logs for last hour"
│   └── Tool: vercel.getDeploymentLogs()
│   └── Trace: [7o-p] Build log analysis
└── Domain Management
    └── Query: "Show custom domains"
    └── Tool: vercel.getDomains()
```

### Local MCP Integration
```
Entry Points:
├── Content Editing
│   └── Query: "Edit the concert photography blog post"
│   └── Tool: content_edit_post
│   └── Trace: [3b] → triggers [1c] → [7b]
├── Manifest Inspection
│   └── Query: "Show me the concert manifest"
│   └── Tool: widget_list + file read
│   └── Trace: [2a-g] API flow
└── Repo Health Check
    └── Query: "Check repository health"
    └── Tool: repo_health
    └── Traces: [1], [5], [7] validation
```

---

*Generated: April 6, 2026*
*Enhancement to: McCal Media Photography Portfolio Platform - Multi-System Codemap*
