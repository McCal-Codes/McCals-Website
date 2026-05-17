# Cloudflare API Subdomain Setup Guide

This guide covers setting up the `api.mcc-cal.com` subdomain to route to your Cloudflare Worker API.

---

## Prerequisites

- ✅ Cloudflare Worker deployed (`tools/cloudflare/complete-worker.js`)
- ✅ Domain `mcc-cal.com` configured in Cloudflare
- ✅ Worker published to Cloudflare
- ✅ KV namespaces created and bound

---

## Step 1: Deploy the Cloudflare Worker

If you haven't already:

```bash
# Install wrangler globally
npm install -g wrangler

# Navigate to worker directory
cd tools/cloudflare

# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create "MCCAL_KV"
# Note the ID returned (looks like: 1234567890abcdef1234567890abcdef)

# Update wrangler.toml with your KV namespace ID
# In the kv_namespaces section:
# { binding = "MCCAL_KV", id = "YOUR_ID_HERE" }

# Set secrets in Cloudflare
wrangler secret put JWT_SECRET
# Paste: d4cbecfe5896b6e7ea92a18aa4095e67427895ec74835dc0dfa93ff318c370e4

wrangler secret put WEBHOOK_SECRET
# Paste: 676bc3e3485ef38f6a7ce9c8ed090432b907ebd7a7fdab9c1fba7b82f5840c8d

wrangler secret put BLOG_AUTHORS
# Paste: [{"id":"author-1","username":"mccal","password":"test-password","name":"McCal"}]

# Deploy the worker
wrangler deploy complete-worker.js
```

After deployment, you'll see output like:
```
✨  Your worker has been published to:
https://mccal-api.<YOUR_ACCOUNT>.workers.dev
```

---

## Step 2: Create DNS Record for `api.mcc-cal.com`

1. Go to **Cloudflare Dashboard** → **Domains** → **mcc-cal.com** → **DNS**
2. Click **Add Record**
3. Configure:
   - **Type**: CNAME
   - **Name**: api
   - **Content**: `mccal-api.<YOUR_ACCOUNT>.workers.dev`
   - **Proxy status**: Proxied (orange cloud)
   - **TTL**: Auto
4. Save

Your subdomain `api.mcc-cal.com` now points to your Worker.

---

## Step 3: Configure Worker Routes (Optional)

If you want requests to `api.mcc-cal.com/*` to reach your Worker, update `wrangler.toml`:

```toml
routes = [
  { pattern = "api.mcc-cal.com/*", zone_name = "mcc-cal.com" }
]
```

Then redeploy:
```bash
wrangler deploy complete-worker.js
```

---

## Step 4: Test the API Endpoints

### Test Login Endpoint
```bash
curl -X POST "https://api.mcc-cal.com/api/v1/blog/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mccal",
    "password": "test-password"
  }'
```

**Expected response:**
```json
{
  "token": "<jwt-token>",
  "author": {
    "id": "author-1",
    "username": "mccal",
    "name": "McCal"
  }
}
```

### Test Get Posts
```bash
curl "https://api.mcc-cal.com/api/v1/blog/posts"
```

**Expected response:**
```json
{
  "posts": [],
  "totalPosts": 0,
  "cached": false
}
```

### Test Create Post (Requires Token)
```bash
TOKEN="your_jwt_token_from_login_response"

curl -X POST "https://api.mcc-cal.com/api/v1/blog/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "excerpt": "Test excerpt",
    "blocks": [{"type": "text", "content": "Hello world"}]
  }'
```

### Test Manifests
```bash
curl "https://api.mcc-cal.com/api/v1/manifests/concert"
```

---

## Step 5: Update Widget Configuration

The Blog Admin Widget is already configured to use `https://api.mcc-cal.com`:

```javascript
const API_BASE = 'https://api.mcc-cal.com/api/v1/blog';
```

The widget will:
1. POST to `https://api.mcc-cal.com/api/v1/blog/auth/login` for authentication
2. GET `https://api.mcc-cal.com/api/v1/blog/posts` for post listings
3. POST to `https://api.mcc-cal.com/api/v1/blog/posts` to create posts

---

## Step 6: Configure CORS

Ensure `ALLOWED_ORIGINS` environment variable in Cloudflare includes your domain:

```
https://mcc-cal.com,https://*.mcc-cal.com,http://localhost:*
```

This allows:
- ✅ `https://mcc-cal.com` (main domain)
- ✅ `https://api.mcc-cal.com` (API subdomain)
- ✅ `https://*.mcc-cal.com` (all subdomains)
- ✅ `http://localhost:*` (local development)

---

## Troubleshooting

### 404 on API Calls
**Problem**: `https://api.mcc-cal.com/api/v1/blog/auth/login` returns 404

**Solutions**:
1. Verify Worker is deployed: `wrangler deployments list`
2. Check CNAME record points to Worker URL: `nslookup api.mcc-cal.com`
3. Verify route pattern in `wrangler.toml` includes `/api/v1/*`
4. Check Worker logs: `wrangler tail`

### 401 on Login
**Problem**: Login returns 401 Unauthorized

**Solutions**:
1. Verify BLOG_AUTHORS secret is set: `wrangler secret list`
2. Check credentials match JSON format: `{"username":"mccal","password":"test-password"}`
3. Verify secret parsing in Worker code
4. Check Worker logs for errors

### CORS Errors
**Problem**: Browser shows CORS error

**Solutions**:
1. Verify ALLOWED_ORIGINS includes your domain
2. Update ALLOWED_ORIGINS: `wrangler secret put ALLOWED_ORIGINS`
3. Test with curl (no CORS issues): `curl https://api.mcc-cal.com/api/v1/blog/posts`
4. Clear browser cache and retry

### DNS Not Resolving
**Problem**: `nslookup api.mcc-cal.com` shows no results

**Solutions**:
1. Wait 5-10 minutes for DNS propagation
2. Verify CNAME record created in Cloudflare DNS
3. Check record is Proxied (orange cloud) not DNS only
4. Test: `nslookup api.mcc-cal.com 1.1.1.1` (Cloudflare DNS)

---

## Environment Variables Reference

Set these in Cloudflare Dashboard → Workers → Settings → Environment Variables:

| Variable | Value | Example |
|----------|-------|---------|
| `JWT_SECRET` | 32-byte hex secret | `d4cbecfe5896b6e7ea92a18aa4095e67427895ec74835dc0dfa93ff318c370e4` |
| `WEBHOOK_SECRET` | 32-byte hex secret | `676bc3e3485ef38f6a7ce9c8ed090432b907ebd7a7fdab9c1fba7b82f5840c8d` |
| `BLOG_AUTHORS` | JSON array | `[{"id":"author-1","username":"mccal","password":"test-password","name":"McCal"}]` |
| `ALLOWED_ORIGINS` | Comma-separated URLs | `https://mcc-cal.com,https://*.mcc-cal.com,http://localhost:*` |
| `MANIFEST_BASE_URL` | GitHub raw URL | `https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main` |

---

## Testing Widget Integration

Once API is live at `api.mcc-cal.com`:

1. Visit your Squarespace site and navigate to the Blog Admin Code Block
2. Enter credentials: `mccal` / `test-password`
3. Click Login
4. You should see the post editor interface
5. Create a test post and submit

The widget will send requests to `https://api.mcc-cal.com/api/v1/blog/*` endpoints.

---

## Production Checklist

- [ ] Worker deployed to Cloudflare
- [ ] KV namespace created and bound
- [ ] Secrets set: JWT_SECRET, WEBHOOK_SECRET, BLOG_AUTHORS
- [ ] DNS CNAME record created: api.mcc-cal.com → Worker URL
- [ ] CORS origins configured correctly
- [ ] Test endpoints with curl (all return 200/201)
- [ ] Widget tested in local dev environment
- [ ] Widget API endpoint set to `https://api.mcc-cal.com`
- [ ] Monitoring: Check Worker Analytics for errors
- [ ] Rate limiting verified (max 100 req/min per IP)

---

**Next Steps**: Monitor Worker analytics and adjust cache TTLs/rate limits based on traffic patterns.
