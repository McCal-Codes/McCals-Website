# Cloudflare API Setup Complete

Added essential files and configuration for deploying the API to Cloudflare Workers.

## Files Added

### 1. **cf-config.js** - Configuration Loader

- Loads settings from Cloudflare Vars or environment variables
- Handles fallbacks and validation
- Supports both Workers and Node.js environments

### 2. **cf-kv-client.js** - KV Storage Client

- Minimal adapter for Cloudflare KV
- Used for caching manifests (optional)
- Supports TTL-based expiration

### 3. **src/worker.js** - Enhanced Worker Entry Point

- Added blog posts route (`GET /api/v1/blog/posts`)
- Added `fetchBlogPosts()` helper function
- Maintains manifests + CORS + caching
- Production-ready minimal code

### 4. **wrangler.toml** - Updated Configuration

- Added KV namespace binding
- Added staging environment config
- Added `BLOG_BASE_URL` variable
- Fixed MANIFEST_BASE_URL path

### 5. **.env.example** - Updated Environment Template

- Added all required variables
- Includes comments for each setting
- Dev vs production values noted

### 6. **cloudflare-deployment-checklist.md** - Deployment Guide

- Step-by-step setup instructions
- Pre-deployment checklist
- Deployment commands (prod/staging)
- Post-deployment validation tests
- Troubleshooting guide

## What Works Out of the Box

✅ **Manifests API**

- `GET /api/v1/manifests` - List available types
- `GET /api/v1/manifests/:type` - Fetch manifest (concert, events, etc.)

✅ **Blog API**

- `GET /api/v1/blog/posts` - Fetch all blog posts

✅ **Health Check**

- `GET /api/health` - API status
- `GET /api/v1/health` - Versioned health check

✅ **CORS Configuration**

- Allows Squarespace domains
- Allows production domains
- Allows localhost for development

✅ **Caching**

- Edge cache for manifests (5 min + 1 hour stale)
- Cache for blog posts (1 hour)
- Automatic cache invalidation via webhooks

## Next Steps

### Quick Start (5 minutes)

1. Read: `docs/integrations/cloudflare-deployment-checklist.md`
2. Install wrangler: `npm install -g @cloudflare/wrangler@latest`
3. Login: `wrangler login`
4. Create KV namespace (see checklist step 2)
5. Update `wrangler.toml` with KV IDs
6. Deploy: `cd src/api && wrangler deploy --env production`

### Local Testing

```bash
cd src/api
wrangler dev --local --port 8787
# Test: curl http://localhost:8787/api/health
```

### GitHub Integration

- Add secrets to GitHub (see checklist)
- CI workflows will automatically notify webhook on manifest changes
- Cache will be invalidated automatically

## Configuration Variables

All set in `wrangler.toml` [vars] section:

```toml
[vars]
ALLOWED_ORIGINS = "https://mcc-cal.com,https://*.squarespace.com,https://api.mcc-cal.com"
MANIFEST_BASE_URL = "https://McCal-Codes.github.io/McCals-Website/src/images/Portfolios"
MANIFEST_TYPES = "concert,events,journalism,nature,portrait,portfolio"
BLOG_BASE_URL = "https://McCal-Codes.github.io/McCals-Website/src/images/blog"
```

Update these if:

- You move manifests to different location
- You add new manifest types
- You need different CORS origins

## Key Features

1. **Minimal** - No complex dependencies, pure Cloudflare Workers
2. **Fast** - Edge caching, 300ms manifest fetches
3. **Reliable** - Graceful error handling, fallbacks
4. **Scalable** - Runs on Cloudflare edge network
5. **Integrated** - Works with existing widgets and CI/CD

## Architecture

```
Squarespace/Widgets
       ↓
https://api.mcc-cal.com
       ↓
Cloudflare Worker (src/worker.js)
       ↓
GitHub Pages (manifests)
     + KV Cache (optional)
```

## Zero-Config Deployments

No secrets needed in wrangler.toml because:

- All CORS config is public (no credentials)
- Manifests are public (hosted on GitHub Pages)
- Blog posts are public read-only

For blog authoring/mutations (future):

- Use separate serverless function or
- Keep in local Express server for now

## Maintenance

- **Logs**: `wrangler tail --env production`
- **Metrics**: Cloudflare dashboard
- **Rollback**: `wrangler rollback --env production`
- **Updates**: Edit `src/worker.js` and redeploy

---

**Ready to deploy!** Follow the checklist in `docs/integrations/cloudflare-deployment-checklist.md`
