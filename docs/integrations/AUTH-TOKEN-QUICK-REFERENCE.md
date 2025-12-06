# Quick Auth Token Reference Card

**Quick copy-paste for local setup:**

## Step 1: Generate Secrets

```bash
# Generate JWT_SECRET
openssl rand -hex 32

# Generate WEBHOOK_SECRET
openssl rand -hex 32
```

## Step 2: Create `.env`

```bash
JWT_SECRET=YOUR_GENERATED_HEX_HERE
WEBHOOK_SECRET=YOUR_GENERATED_HEX_HERE
BLOG_AUTHORS=[{"id":"author-1","username":"mccal","password":"test-password","name":"McCal"}]
MANIFEST_BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
```

## Step 3: Start Dev & Test

```bash
npm run dev
# Visit: http://localhost:3000/test-blog-admin.html
# Login: mccal / test-password
```

## Production Secrets Generator

For CI/CD: Create a script that generates secrets:

```bash
#!/bin/bash
# scripts/generate-auth-secrets.sh

echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "WEBHOOK_SECRET=$(openssl rand -hex 32)"
```

Run with:
```bash
bash scripts/generate-auth-secrets.sh
```

## BLOG_AUTHORS Format

Single author:
```json
[{"id":"author-1","username":"mccal","password":"secure-password","name":"McCal"}]
```

Multiple authors:
```json
[
  {"id":"author-1","username":"mccal","password":"password1","name":"McCal"},
  {"id":"author-2","username":"contributor","password":"password2","name":"Contributor"}
]
```

## Cloudflare Deployment Checklist

- [ ] Generate JWT_SECRET and WEBHOOK_SECRET
- [ ] Set environment variables in Cloudflare Dashboard
- [ ] Create KV namespace: `wrangler kv:namespace create "MCCAL_KV"`
- [ ] Deploy Worker: `wrangler deploy tools/cloudflare/complete-worker.js`
- [ ] Test login endpoint: `curl -X POST "$WORKER_URL/api/v1/blog/auth/login" ...`
- [ ] Update widget API_BASE to Worker URL
- [ ] Test in Blog Admin Widget

## Testing Endpoints

```bash
# Test login and get token
TOKEN=$(curl -s -X POST "http://localhost:3000/api/v1/blog/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"mccal","password":"test-password"}' | jq -r '.token')

# Use token to get posts
curl "http://localhost:3000/api/v1/blog/posts" \
  -H "Authorization: Bearer $TOKEN"

# Create post (requires token)
curl -X POST "http://localhost:3000/api/v1/blog/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Post",
    "excerpt":"Test excerpt",
    "blocks":[{"type":"text","content":"Hello world"}]
  }'
```

## Webhook Testing

```bash
# Purge cache (requires WEBHOOK_SECRET)
curl -X POST "http://localhost:3000/api/v1/webhooks/purge" \
  -H "X-Webhook-Secret: YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"type":"manifest"}'

# Warm cache
curl -X POST "http://localhost:3000/api/v1/webhooks/warm" \
  -H "X-Webhook-Secret: YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"type":"manifest","key":"concert-manifest.json"}'
```

## Environment Variable Checklists

### Local Development (`.env` file)
```
JWT_SECRET ✓
WEBHOOK_SECRET ✓
BLOG_AUTHORS ✓
MANIFEST_BASE_URL ✓
CORS_ORIGINS ✓
```

### Production (Cloudflare Dashboard → Workers → Settings)
```
JWT_SECRET ✓
WEBHOOK_SECRET ✓
BLOG_AUTHORS ✓
MANIFEST_BASE_URL ✓
CORS_ORIGINS ✓
KV Namespace Binding ✓
```

---

**Full Guide:** See `docs/integrations/AUTH-SETUP-GUIDE.md` for detailed instructions, security best practices, and troubleshooting.
