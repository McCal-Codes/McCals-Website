# GitHub Actions + Cloudflare Integration

Complete guide for automated cache management via GitHub Actions workflows.

## Overview

When manifest files are published, GitHub Actions automatically triggers Cloudflare cache refresh to ensure edge cache stays in sync with the latest data.

## Architecture

```
┌─────────────────────┐
│ Push to main branch │
│  (manifest changes) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ publish-manifests-  │
│ cdn.yml workflow    │
│ runs                │
└──────────┬──────────┘
           │
           ├─── Generate manifests
           ├─── Commit to manifests-cdn branch
           ├─── Tag release
           ├─── Push to GitHub
           │
           ▼
┌─────────────────────┐
│ POST /webhooks/     │
│ refresh endpoint    │
│ with webhook secret │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Cloudflare Worker   │
│ purges and warms    │
│ edge cache          │
└─────────────────────┘
```

## Required GitHub Secrets

Set these in your repository settings: **Settings → Secrets and variables → Actions → New repository secret**

### `CLOUDFLARE_WEBHOOK_SECRET`

**Value:** Your generated webhook secret from `.env` file

```bash
# Get from .env file (or generate new one)
grep WEBHOOK_SECRET .env
# Example: WEBHOOK_SECRET=<generated-webhook-secret>
```

**Purpose:** Authenticates GitHub Actions requests to Cloudflare webhook endpoints

**Security:** Never commit this to the repository; only store in GitHub Secrets

## Workflow Integration

### Trigger Conditions

The workflow runs when:
- Pushing to `main` branch
- Changes detected in:
  - `src/images/Portfolios/**`
  - `scripts/manifest/**`
  - `scripts/utils/**manifest**`
  - Manifest workflow file itself

### Workflow Steps

1. **Generate Manifests**
   - Runs `npm run manifest:generate`
   - Creates aggregated manifest files for each portfolio type

2. **Detect Changes**
   - Checks if any manifest files were modified
   - Skips remaining steps if no changes

3. **Create Release**
   - Creates `manifests-cdn` branch
   - Commits manifest updates
   - Tags release with timestamp (e.g., `manifests-202512061530`)

4. **Push to GitHub**
   - Force-pushes `manifests-cdn` branch
   - Pushes tag for jsDelivr CDN access

5. **Cloudflare Cache Refresh** ⭐
   - Calls `POST https://api.mcc-cal.com/api/v1/webhooks/refresh`
   - Includes `X-Webhook-Secret` header for authentication
   - Purges stale cache entries and warms with fresh data
   - Non-blocking: continues even if webhook fails

## Webhook Endpoints

### `POST /api/v1/webhooks/refresh`

**Purpose:** Combined purge + warm operation for efficient cache management

**Headers:**
```bash
Content-Type: application/json
X-Webhook-Secret: <your-webhook-secret>
```

**Request Body:** (optional)
```json
{
  "manifests": ["concert", "events", "journalism"],
  "reason": "GitHub Actions manifest publish"
}
```

**Response:**
```json
{
  "success": true,
  "purged": 12,
  "warmed": 12,
  "timestamp": 1765032000000
}
```

### `POST /api/v1/webhooks/purge`

**Purpose:** Only purge cache without warming

**Headers:** Same as refresh

**Response:**
```json
{
  "success": true,
  "purged": 12,
  "timestamp": 1765032000000
}
```

### `POST /api/v1/webhooks/warm`

**Purpose:** Pre-fetch and cache manifests without purging

**Headers:** Same as refresh

**Response:**
```json
{
  "success": true,
  "warmed": 12,
  "timestamp": 1765032000000
}
```

## Testing Locally

### Test Webhook Endpoint

```bash
# Get webhook secret from .env
WEBHOOK_SECRET=$(grep WEBHOOK_SECRET .env | cut -d= -f2)

# Test refresh endpoint
curl -X POST "https://api.mcc-cal.com/api/v1/webhooks/refresh" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
  -d '{"manifests": ["concert"], "reason": "Manual test"}'
```

Expected output:
```json
{
  "success": true,
  "purged": 6,
  "warmed": 6,
  "timestamp": 1765032000000
}
```

### Simulate GitHub Actions Workflow

```bash
# 1. Make manifest changes
echo '{"test": true}' > src/images/Portfolios/Concert/test-manifest.json

# 2. Commit changes
git add src/images/Portfolios/Concert/test-manifest.json
git commit -m "test: trigger manifest workflow"

# 3. Push to main
git push origin main

# 4. Monitor workflow
# Visit: https://github.com/McCal-Codes/mccal-api/actions

# 5. Check logs for webhook call
# Look for "Cloudflare cache refreshed successfully" in workflow logs
```

## Monitoring

### GitHub Actions Logs

View workflow runs: **Actions tab → Publish Manifests to CDN**

Look for:
- ✅ "Cloudflare cache refreshed successfully" (200-299 status)
- ⚠️ "Cloudflare cache refresh returned HTTP 4XX" (non-fatal warning)
- ℹ️ "Cloudflare cache purge skipped" (secret not configured)

### Cloudflare Worker Logs

View real-time logs:
```bash
cd tools/cloudflare
npx wrangler tail
```

Filter for webhook calls:
```bash
npx wrangler tail --format pretty | grep webhook
```

### Cache Hit/Miss Tracking

Check cache effectiveness:
```bash
# Check manifest cache status
curl -I "https://api.mcc-cal.com/api/v1/manifests/concert"
# Look for: X-Cache: HIT or MISS

# Get cache stats
curl "https://api.mcc-cal.com/api/v1/cache/stats"
```

## Troubleshooting

### Webhook Secret Not Configured

**Symptom:** Workflow logs show "Cloudflare cache purge skipped"

**Solution:**
1. Generate webhook secret: `openssl rand -hex 32`
2. Add to GitHub Secrets: `CLOUDFLARE_WEBHOOK_SECRET`
3. Verify in Cloudflare: `npx wrangler secret list`

### Authentication Failed (401)

**Symptom:** "Cloudflare cache refresh returned HTTP 401"

**Solution:**
1. Verify secret matches: Compare GitHub Secret with Cloudflare Worker secret
2. Regenerate if needed:
   ```bash
   NEW_SECRET=$(openssl rand -hex 32)
   echo "$NEW_SECRET" | npx wrangler secret put WEBHOOK_SECRET
   # Then update GitHub Secret
   ```

### Timeout (30s)

**Symptom:** Workflow times out waiting for webhook response

**Solution:**
- This is non-fatal; cache refresh may still succeed
- Check Cloudflare Worker logs: `npx wrangler tail`
- Consider increasing `--max-time` in workflow if consistent

### No Cache Purge After Deploy

**Symptom:** Old manifest data still served after workflow completes

**Possible Causes:**
1. Webhook failed silently (check logs)
2. Manifest paths don't match Worker expectations
3. Cache headers preventing purge

**Debug Steps:**
```bash
# 1. Check manifest is accessible
curl -I "https://raw.githubusercontent.com/McCal-Codes/mccal-api/manifests-cdn/src/images/Portfolios/Concert/concert-manifest.json"

# 2. Check API serves latest
curl "https://api.mcc-cal.com/api/v1/manifests/concert" | jq '.bands | length'

# 3. Manually trigger refresh
WEBHOOK_SECRET=$(grep WEBHOOK_SECRET .env | cut -d= -f2)
curl -X POST "https://api.mcc-cal.com/api/v1/webhooks/refresh" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET"
```

## Best Practices

### 1. Use Refresh Over Purge
- `refresh` combines purge + warm for zero downtime
- `purge` alone causes cache misses until next request

### 2. Batch Manifest Changes
- Group related changes in single commit
- Reduces webhook calls and cache churn

### 3. Monitor Cache Hit Rates
- Target >90% cache hit rate for manifests
- Low hit rates indicate purging too frequently

### 4. Non-Blocking Webhooks
- Workflow continues even if webhook fails
- Manifests still published to GitHub/jsDelivr
- Users can manually trigger refresh if needed

### 5. Secret Rotation
- Rotate webhook secret quarterly
- Update both GitHub Secret and Cloudflare Worker
- Test after rotation

## Manual Operations

### Force Cache Refresh

```bash
# Get webhook secret
WEBHOOK_SECRET=$(grep WEBHOOK_SECRET .env | cut -d= -f2)

# Refresh all manifests
curl -X POST "https://api.mcc-cal.com/api/v1/webhooks/refresh" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
  -d '{"manifests": ["concert", "events", "journalism", "nature", "portrait"], "reason": "Manual refresh"}'
```

### Warm Specific Manifest

```bash
# Warm only concert manifest
curl -X POST "https://api.mcc-cal.com/api/v1/webhooks/warm" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
  -d '{"manifests": ["concert"]}'
```

### Purge Without Warming

```bash
# Nuclear option: purge all manifest cache
curl -X POST "https://api.mcc-cal.com/api/v1/webhooks/purge" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET"
```

## Security Considerations

### Webhook Secret Protection
- Never log the secret in workflows
- Use GitHub Secrets (encrypted at rest)
- Rotate if accidentally exposed

### Rate Limiting
- Worker enforces 100 req/min per IP
- GitHub Actions IP ranges may vary
- Webhook endpoints exempt from rate limits

### CORS Restrictions
- Webhook endpoints require proper headers
- Public manifests allow CORS from *.mcc-cal.com
- Authentication endpoints enforce strict CORS

## Related Documentation

- [CLOUDFLARE-SUBDOMAIN-SETUP.md](../integrations/CLOUDFLARE-SUBDOMAIN-SETUP.md) - Complete Cloudflare setup
- [AUTH-SETUP-GUIDE.md](../integrations/AUTH-SETUP-GUIDE.md) - Authentication configuration
- [manifest-cdn.md](../manifest-cdn.md) - jsDelivr CDN integration

---

Last updated: December 6, 2025
