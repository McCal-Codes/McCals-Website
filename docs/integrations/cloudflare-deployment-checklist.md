# Cloudflare Deployment Checklist

Quick checklist for deploying mccal-api to Cloudflare Workers.

## Pre-Deployment Setup

### 1. Cloudflare Account & CLI

- [ ] Have Cloudflare account with mcc-cal.com domain
- [ ] Install wrangler: `npm install -g @cloudflare/wrangler@latest`
- [ ] Authenticate: `wrangler login`
- [ ] Verify: `wrangler whoami`

### 2. KV Namespace Setup

```bash
# Create production KV namespace
wrangler kv:namespace create "MCCAL_KV" --preview false

# Create preview KV namespace
wrangler kv:namespace create "MCCAL_KV" --preview
```

Copy the namespace IDs returned and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "MCCAL_KV"
id = "YOUR_PRODUCTION_ID_HERE"
preview_id = "YOUR_PREVIEW_ID_HERE"
```

### 3. Environment Variables

No secrets needed in wrangler.toml - all vars are public CORS/config.

Update `wrangler.toml` vars section if needed:

- `ALLOWED_ORIGINS` - domains that can access the API
- `MANIFEST_BASE_URL` - where manifests are hosted
- `BLOG_BASE_URL` - where blog-posts.json is hosted

### 4. GitHub Secrets (for CI webhooks)

Add these to GitHub repo settings → Secrets:

- `MANIFEST_WEBHOOK_URL` = `https://api.mcc-cal.com/api/v1/webhooks/refresh`
- `WEBHOOK_SECRET` = a random 32-character string

## Deployment Commands

### Deploy to Production

```bash
cd src/api
wrangler deploy --env production
```

### Deploy to Staging

```bash
cd src/api
wrangler deploy --env staging
```

### Local Development

```bash
cd src/api
wrangler dev --local --port 8787
# Visit http://localhost:8787/api/health
```

### Watch Logs

```bash
wrangler tail --env production
```

## Post-Deployment Validation

### Health Check

```bash
curl https://api.mcc-cal.com/api/health
# Should return: { "status": "ok", "timestamp": "..." }
```

### Manifest Routes

```bash
# List available manifests
curl https://api.mcc-cal.com/api/v1/manifests

# Get concert manifest
curl https://api.mcc-cal.com/api/v1/manifests/concert
```

### Blog Routes

```bash
# Get blog posts
curl https://api.mcc-cal.com/api/v1/blog/posts
```

### CORS Test

```bash
curl -H "Origin: https://example.squarespace.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS https://api.mcc-cal.com/api/health -v
# Should see Access-Control-Allow-Origin header
```

## Troubleshooting

### "Cannot find MANIFEST_BASE_URL"

- Check `wrangler.toml` has MANIFEST_BASE_URL in [vars]
- Check manifests are actually hosted at that URL

### "KV not responding"

- Verify KV namespace ID in wrangler.toml
- Run: `wrangler kv:namespace list`

### "CORS errors from widgets"

- Check ALLOWED_ORIGINS in wrangler.toml
- Include `https://*.squarespace.com` for preview domains

### "Blog posts 404"

- Verify BLOG_BASE_URL points to correct location
- Check blog-posts.json exists at that URL

## Files Added for Cloudflare

- `src/api/src/worker.js` - Cloudflare Worker entry point (manifests + blog)
- `src/api/cf-config.js` - Configuration loader for Cloudflare
- `src/api/cf-kv-client.js` - KV storage adapter
- `src/api/wrangler.toml` - Cloudflare deployment config

## Next Steps

1. Complete pre-deployment setup (KV namespace, wrangler login)
2. Update wrangler.toml with your KV IDs
3. Run: `cd src/api && wrangler deploy --env production`
4. Test endpoints from Post-Deployment Validation section
5. Update GitHub secrets for webhook integration
6. Configure widgets to use new API endpoint

## Rollback

If something breaks:

```bash
# Rollback to previous deployment
wrangler rollback --env production
```

Check deployment history:

```bash
wrangler deployments list
```
