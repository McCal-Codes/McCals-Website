# API Deployment to Cloudflare Workers

## Overview

The McCal Media API is designed for deployment to **Cloudflare Workers** at `api.mcc-cal.com`. This document covers deployment setup, configuration, and integration with widgets.

**Current Status**: API repo is a Git submodule at `src/api/`. All routes are functional and ready for deployment.

> **Cloudflare account reference**
>
> - **Account ID**: `2ac16bbf295c2dacf6e2d7c135c8ebdb`
> - **Workers.dev subdomain**: `mccal`
> - **Default preview URL**: `https://mccal-api.mccal.workers.dev`
> - **KV Namespace**: bind `MCCAL_KV` for blog tokens/posts (create via `wrangler kv namespace create MCCAL_KV`)

---

## Quick Start: Deploy to Cloudflare

### 1. Prerequisites

- Cloudflare account with Workers enabled
- `wrangler` CLI installed: `npm install -g wrangler`
- API repo available at `src/api/` (submodule)
- Environment secrets configured in GitHub and Cloudflare

### 2. Configure `wrangler.toml`

Create or update `src/api/wrangler.toml`:

```toml
name = "mccal-api"
type = "javascript"
account_id = "2ac16bbf295c2dacf6e2d7c135c8ebdb"
workers_dev = true
subdomain = "mccal"
route = "api.mcc-cal.com/*"
zone_id = "your-cloudflare-zone-id"

[env.production]
name = "mccal-api-prod"
routes = [
  { pattern = "api.mcc-cal.com/*", zone_name = "mcc-cal.com" }
]

[env.staging]
name = "mccal-api-staging"
routes = [
  { pattern = "api-staging.mcc-cal.com/*", zone_name = "mcc-cal.com" }
]

[build]
command = "npm ci && npm run build:worker"
cwd = "."
main = "src/worker.js"

[env.production.build]
cwd = "."

[env.staging.build]
cwd = "."

[[env.production.triggers.crons]]
cron = "0 * * * *"  # Cache warming every hour

[kv_namespaces]
binding = "BLOG_CACHE"
id = "your-kv-namespace-id"

[env.production.kv_namespaces]
binding = "BLOG_CACHE"
id = "your-production-kv-namespace-id"

[env.staging.kv_namespaces]
binding = "BLOG_CACHE"
id = "your-staging-kv-namespace-id"
```

### 3. Create Cloudflare Worker Entry Point

File: `src/api/src/worker.js`

```javascript
/**
 * Cloudflare Worker Entry Point
 *
 * Wraps the Express API for deployment to Cloudflare Workers.
 * Routes all requests to the Express app.
 */

import express from "express";

// Import the Express API server
const app = require("../api/server.js");

/**
 * Cloudflare Worker Handler
 */
export default {
  async fetch(request, env, ctx) {
    // Convert Cloudflare Request to Node.js-like format
    const url = new URL(request.url);
    const path = url.pathname + url.search;

    // Create a mock Node.js req/res for Express
    const req = {
      method: request.method,
      url: path,
      headers: Object.fromEntries(request.headers),
      body: request.body ? await request.text() : undefined,
    };

    // This is handled by Express middleware
    return new Promise((resolve) => {
      // Express will handle routing and respond
      app(req, {
        send: (body) => resolve(new Response(body, { status: 200 })),
        json: (data) =>
          resolve(
            new Response(JSON.stringify(data), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          ),
        status: (code) => ({
          json: (data) =>
            resolve(
              new Response(JSON.stringify(data), {
                status: code,
                headers: { "Content-Type": "application/json" },
              })
            ),
        }),
      });
    });
  },

  async scheduled(event, env, ctx) {
    // Cache warming cron job (runs hourly)
    console.log("Running scheduled cache warming...");
    // Trigger internal manifest warming endpoint
    // await fetch(`http://localhost:3001/api/v1/cache/warm`, {
    //   headers: { 'x-api-key': env.API_KEY }
    // });
  },
};
```

### 4. Set Environment Variables

In Cloudflare Workers Dashboard or via `wrangler`:

```bash
wrangler secret put WEBHOOK_SECRET
wrangler secret put BLOG_JWT_SECRET
wrangler secret put NODE_ENV  # Set to "production"
wrangler secret put BLOG_AUTHORS  # JSON string (see Blog Authoring section)
```

Or in `wrangler.toml`:

```toml
[env.production.vars]
NODE_ENV = "production"
API_BASE = "https://api.mcc-cal.com"
MANIFEST_BASE = "https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@main/src/images/Portfolios"
BLOG_BASE_URL = "https://McCal-Codes.github.io/McCals-Website/src/images/blog"
BLOG_AUTHORS = "[{\"id\":\"auth-001\",\"username\":\"mccal\",\"password\":\"CHANGE_ME\",\"name\":\"Caleb\"}]"

[env.production.secrets]
WEBHOOK_SECRET = "..."
BLOG_JWT_SECRET = "..."
REDIS_URL = "..."  # Optional: Redis for caching if available

[[env.production.kv_namespaces]]
binding = "MCCAL_KV"
id = "<your-production-kv-id>"
```

### 5. Build and Deploy

```bash
# Build for Cloudflare
cd src/api
npm run build:worker

# Deploy to production
wrangler publish --env production

# Or deploy to staging first
wrangler publish --env staging
```

### 6. Update DNS

In Cloudflare Dashboard:

- Create CNAME: `api.mcc-cal.com` → `mccal-api.mccal.workers.dev` (or your Worker URL)
- Ensure SSL/TLS is set to "Flexible" or "Full"

---

## Blog Authoring via Cloudflare KV

The v0.3+ blog widget expects the Worker to handle `/api/v1/blog/auth/login` and `/api/v1/blog/posts`. These routes rely on Workers KV for both session tokens and stored posts.

### Required Resources

- **KV namespace** bound as `MCCAL_KV` (create via `wrangler kv namespace create MCCAL_KV`).
- **`BLOG_AUTHORS` variable**: JSON string array or `{ "authors": [] }` object with `{ id, username, password, name }` entries.
- **Optional `BLOG_BASE_URL`**: Used to seed KV with the existing `blog-posts.json` manifest on first request.

### Example: Setting `BLOG_AUTHORS`

```bash
wrangler secret put BLOG_AUTHORS
# Paste JSON, e.g.
#[
#  {"id":"auth-001","username":"mccal","password":"your-password","name":"Caleb McCartney"}
#]
```

### Widget Configuration

Use the new data attributes in `v0.3.0-authoring-cloudflare.html`:

```html
<div class="blog" id="blog" data-api-base="https://api.mcc-cal.com/api/v1/blog" data-feed-url="https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@main/src/images/blog/blog-posts.json" data-api-read="true"></div>
```

- `data-api-base`: Points login/publish/post fetches to the Cloudflare Worker.
- `data-feed-url`: JSON fallback for when the API is unavailable.
- `data-api-read`: `true` (default) attempts API read first; set to `false` to force JSON-only reads.

## API Routes (Ready for Cloudflare)

### Health & Status

```
GET /api/health                  Health check (non-versioned)
GET /api/v1/health              Health check (v1)
GET /api/v1/ping                Ping endpoint
```

### Manifests

```
GET /api/v1/manifests                  List all manifest types
GET /api/v1/manifests/:type            Get specific manifest (concert, events, journalism, nature, portrait, universal)
```

**Example Response** (`/api/v1/manifests/concert`):

```json
{
  "version": "1.0.0",
  "generated": "2025-12-04T02:30:00Z",
  "totalBands": 16,
  "bands": [
    { "bandName": "...", "folderPath": "...", "totalImages": 12, "images": [...] }
  ]
}
```

### Blog (Authoring)

```
GET  /api/v1/blog/posts                       Get all posts (Cloudflare KV with JSON fallback)
POST /api/v1/blog/posts                       Create post (auth required, KV persistence)
POST /api/v1/blog/auth/login                  Login with credentials (sessions stored in KV)
```

**Login Example**:

```bash
curl -X POST https://api.mcc-cal.com/api/v1/blog/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mccal","password":"your-password"}'

# Response:
{
  "token": "opaque-session-token",
  "author": { "id": "auth-001", "username": "mccal", "name": "Caleb McCartney" }
}
```

**Create Post Example**:

```bash
curl -X POST https://api.mcc-cal.com/api/v1/blog/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "New Post",
    "excerpt": "Brief summary",
    "content": ["Paragraph 1", "Paragraph 2"]
  }'
```

### Webhooks (Cache Management)

```
POST /api/v1/webhooks/refresh/:type        Refresh cache for specific manifest (admin only, secret required)
POST /api/v1/webhooks/invalidate/:type     Invalidate cache for specific manifest (admin only)
POST /api/v1/webhooks/invalidate-all       Invalidate all manifest caches (admin only)
```

**Called Automatically by CI**:

- After manifest generation (concert, events, journalism, nature, portrait, universal)
- Secret passed via `x-webhook-secret` header
- Triggered by `.github/workflows/*-manifest.yml` workflows

---

## Widget Integration

Widgets fetch live data from the API instead of bundled manifests:

### Concert Portfolio v4.8+ (Example)

```javascript
// Widget code (pseudo)
const API_BASE = "https://api.mcc-cal.com/api/v1";

async function loadConcertData() {
  const res = await fetch(`${API_BASE}/manifests/concert`);
  const manifest = await res.json();

  // Render with live data
  renderGallery(manifest.bands);
}
```

### Blog Feed v0.3+ (Authoring)

```javascript
// Read posts (no auth)
const posts = await fetch("https://api.mcc-cal.com/api/v1/blog/posts").then((r) => r.json());

// Login (required for publishing)
const loginRes = await fetch("https://api.mcc-cal.com/api/v1/blog/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "mccal", password: "..." }),
});
const { token } = await loginRes.json();

// Create post
await fetch("https://api.mcc-cal.com/api/v1/blog/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: "New Post",
    excerpt: "Summary",
    content: ["Para 1", "Para 2"],
  }),
});
```

---

## CORS Configuration

The API allows requests from:

- `mcc-cal.com` and `*.mcc-cal.com` (production domain)
- `.squarespace.com` (Squarespace preview)
- `.sqsp.com` (Squarespace CDN)
- `localhost:3000` and `localhost:3001` (development)

Update in `src/api/server.js` if you need to add more origins.

---

## Cache Strategy

- **Manifests**: Cached for 24 hours (configurable)
- **Blog Posts**: Cached for 1 hour (localStorage on client, server-side TTL via Redis or KV)
- **Cache Invalidation**: Via webhook endpoint after CI runs manifest generators

**Manual Cache Refresh**:

```bash
curl -X POST https://api.mcc-cal.com/api/v1/webhooks/refresh/concert \
  -H "x-webhook-secret: ${WEBHOOK_SECRET}"
```

---

## Monitoring & Logs

In Cloudflare Workers Dashboard:

- View real-time logs: Workers → mccal-api → Logs
- Monitor errors and performance
- Set up alerts for error rates

---

## Troubleshooting

### 404 on `/api/v1/blog/...`

- Ensure blog routes are imported in `src/api/versions/v1/index.js`
- Check that `src/api/routes/blog.js` exists and exports the router
- Verify `NODE_ENV` is set correctly (routes mount conditionally in dev)

### Cache Not Updating After Manifest Changes

- Verify webhook secret is correct in GitHub secrets
- Check Cloudflare Worker logs for webhook calls
- Manually refresh: `curl -X POST https://api.mcc-cal.com/api/v1/webhooks/refresh/concert -H "x-webhook-secret: ..."`

### CORS Errors from Widgets

- Ensure Squarespace domain is in CORS allowlist
- Check `Access-Control-Allow-Origin` headers in response
- Verify `credentials: true` in widget fetch if needed

---

## Next Steps

1. **Finalize `wrangler.toml`** with your Cloudflare account ID, zone ID, KV namespace IDs
2. **Set secrets** in Cloudflare Dashboard
3. **Deploy staging** first: `wrangler publish --env staging`
4. **Test widgets** against staging API
5. **Deploy production**: `wrangler publish --env production`
6. **Update widget URLs** to use `https://api.mcc-cal.com` instead of localhost
7. **Monitor logs** and performance post-deployment

---

**Last Updated**: 2025-12-04
**Status**: Ready for Cloudflare deployment
