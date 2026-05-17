# McCal API - Cloudflare Worker Deployment Guide

Complete guide for deploying the McCal API Cloudflare Worker with blog functionality.

## Quick Start

1. **Prerequisites:**
   - Cloudflare account with Workers enabled
   - Wrangler CLI installed: `npm install -g wrangler`
   - KV namespace created

2. **Deploy:**
   ```bash
   cd tools/cloudflare
   wrangler deploy complete-worker.js
   ```

## Environment Configuration

### Required Environment Variables

```bash
# KV Namespace (create first)
wrangler kv:namespace create "MCCAL_KV"

# Secrets (set with wrangler)
wrangler secret put WEBHOOK_SECRET
wrangler secret put BLOG_JWT_SECRET
wrangler secret put BLOG_AUTHORS

# Environment variables
ALLOWED_ORIGINS="https://mcc-cal.com,https://*.mcc-cal.com,http://localhost:*"
MANIFEST_BASE_URL="https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main"
```

### wrangler.toml Configuration

Create `tools/cloudflare/wrangler.toml`:

```toml
name = "mccal-api"
main = "complete-worker.js"
compatibility_date = "2024-01-01"

# KV Namespace
kv_namespaces = [
  { binding = "MCCAL_KV", id = "your_kv_namespace_id" }
]

# Environment variables
[vars]
ALLOWED_ORIGINS = "https://mcc-cal.com,https://*.mcc-cal.com,http://localhost:*"
MANIFEST_BASE_URL = "https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main"

# Route configuration
routes = [
  { pattern = "mcc-cal.com/api/*", zone_name = "mcc-cal.com" }
]
```

## Blog Authors Configuration

The `BLOG_AUTHORS` secret should be a JSON array of author objects:

```json
[
  {
    "id": "mccal",
    "username": "mccal",
    "password": "your-secure-password-here",
    "name": "McCal"
  }
]
```

Set it with:
```bash
echo '[{"id":"mccal","username":"mccal","password":"your-password","name":"McCal"}]' | wrangler secret put BLOG_AUTHORS
```

## Deployment Steps

### 1. Create KV Namespace

```bash
# Create production KV namespace
wrangler kv:namespace create "MCCAL_KV"

# Create preview namespace for testing
wrangler kv:namespace create "MCCAL_KV" --preview
```

Save the namespace IDs from the output.

### 2. Configure wrangler.toml

Update `tools/cloudflare/wrangler.toml` with your KV namespace ID:

```toml
kv_namespaces = [
  { binding = "MCCAL_KV", id = "abc123..." }
]
```

### 3. Set Secrets

```bash
# Webhook secret (for manifest refresh)
echo "your-webhook-secret-here" | wrangler secret put WEBHOOK_SECRET

# JWT secret (for blog authentication)
echo "your-jwt-secret-here" | wrangler secret put BLOG_JWT_SECRET

# Blog authors (JSON array)
echo '[{"id":"mccal","username":"mccal","password":"your-password","name":"McCal"}]' | wrangler secret put BLOG_AUTHORS
```

### 4. Deploy Worker

```bash
cd tools/cloudflare
wrangler deploy complete-worker.js
```

### 5. Configure Custom Domain (Optional)

In Cloudflare dashboard:
1. Go to Workers & Pages
2. Select your worker
3. Click "Triggers" tab
4. Add custom domain: `mcc-cal.com/api/*`

## API Endpoints Reference

### Health Check
```bash
GET https://mcc-cal.com/api/v1/health
```

### Manifests
```bash
# List manifest types
GET https://mcc-cal.com/api/v1/manifests

# Get specific manifest
GET https://mcc-cal.com/api/v1/manifests/concert
GET https://mcc-cal.com/api/v1/manifests/events
GET https://mcc-cal.com/api/v1/manifests/journalism
```

### Blog Authentication
```bash
# Login (returns JWT token)
POST https://mcc-cal.com/api/v1/blog/auth/login
Content-Type: application/json

{
  "username": "mccal",
  "password": "your-password"
}

# Response:
{
  "token": "<jwt-token>",
  "author": {
    "id": "mccal",
    "username": "mccal",
    "name": "McCal"
  }
}
```

### Blog Posts
```bash
# Get all posts
GET https://mcc-cal.com/api/v1/blog/posts

# Create post (auth required)
POST https://mcc-cal.com/api/v1/blog/posts
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "My First Post",
  "excerpt": "This is an excerpt",
  "content": ["Paragraph 1", "Paragraph 2"],
  "images": [
    {
      "src": "https://example.com/image.jpg",
      "alt": "Image description",
      "caption": "Optional caption"
    }
  ]
}
```

### Webhooks (CI/CD)
```bash
# Purge cache
POST https://mcc-cal.com/api/v1/webhooks/purge
X-Webhook-Secret: your-secret

# Warm cache
POST https://mcc-cal.com/api/v1/webhooks/warm
X-Webhook-Secret: your-secret

# Refresh (purge + warm)
POST https://mcc-cal.com/api/v1/webhooks/refresh
X-Webhook-Secret: your-secret
```

### Cache Stats
```bash
GET https://mcc-cal.com/api/v1/cache/stats
```

## Testing Locally

```bash
# Start local development server
wrangler dev complete-worker.js

# Test endpoints
curl http://localhost:8787/api/v1/health
curl http://localhost:8787/api/v1/manifests
curl http://localhost:8787/api/v1/manifests/concert
```

## GitHub Actions Integration

Update `.github/workflows/publish-manifests-cdn.yml` to call webhook after deployment:

```yaml
- name: Refresh Cloudflare Cache
  if: success()
  run: |
    curl -X POST https://mcc-cal.com/api/v1/webhooks/refresh \
      -H "X-Webhook-Secret: ${{ secrets.CLOUDFLARE_WEBHOOK_SECRET }}"
```

## Security Considerations

1. **JWT Secret:** Use a strong, random secret for `BLOG_JWT_SECRET` (minimum 32 characters)
2. **Webhook Secret:** Use a strong, random secret for `WEBHOOK_SECRET`
3. **Author Passwords:** Use strong, unique passwords for each author
4. **HTTPS Only:** Worker only serves over HTTPS in production
5. **CORS:** Configure `ALLOWED_ORIGINS` to only include trusted domains
6. **Rate Limiting:** Automatically enforced (100 requests/minute per IP)

## Monitoring

### View Logs
```bash
wrangler tail
```

### Check KV Storage
```bash
# List keys
wrangler kv:key list --namespace-id=your_kv_namespace_id

# Get value
wrangler kv:key get --namespace-id=your_kv_namespace_id "blog:posts"

# Delete value
wrangler kv:key delete --namespace-id=your_kv_namespace_id "blog:posts"
```

### Cache Stats
```bash
curl https://mcc-cal.com/api/v1/cache/stats
```

## Troubleshooting

### KV Not Configured Error
- Ensure KV namespace is created
- Verify namespace ID in wrangler.toml
- Check binding name is "MCCAL_KV"

### Unauthorized Errors
- Verify secrets are set: `wrangler secret list`
- Check JWT token is valid and not expired
- Ensure `BLOG_AUTHORS` JSON is valid

### CORS Errors
- Check `ALLOWED_ORIGINS` includes your domain
- Verify origin is in correct format (no trailing slash)
- Test with wildcard: `"*"` (temporary, not for production)

### Manifest Not Found
- Verify `MANIFEST_BASE_URL` is correct
- Check GitHub raw URL is accessible
- Test manifest URL in browser

## Production Checklist

- [ ] KV namespace created
- [ ] All secrets set (WEBHOOK_SECRET, BLOG_JWT_SECRET, BLOG_AUTHORS)
- [ ] wrangler.toml configured with correct namespace ID
- [ ] ALLOWED_ORIGINS configured with production domains
- [ ] Custom domain configured (optional)
- [ ] GitHub Actions webhook secret added
- [ ] Test all endpoints with curl/Postman
- [ ] Blog admin widget updated with production API URL
- [ ] Monitor logs for errors after deployment

## Updating the Worker

```bash
# Make changes to complete-worker.js
nano complete-worker.js

# Deploy updates
wrangler deploy complete-worker.js

# Verify deployment
curl https://mcc-cal.com/api/v1/health
```

## Rollback

```bash
# View deployments
wrangler deployments list

# Rollback to specific deployment
wrangler rollback [deployment-id]
```

## Support

For issues or questions:
- Check logs: `wrangler tail`
- Review Cloudflare Workers documentation
- Contact McCal Media support
