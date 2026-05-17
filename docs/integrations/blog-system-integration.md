# McCal Blog System - Complete Integration Summary

Complete documentation of the blog authoring system with Cloudflare Worker backend.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Flow                                │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1. Opens blog admin widget
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  Blog Admin Widget (v1.0.0)                                      │
│  - Login form with username/password                             │
│  - Post editor with dynamic content blocks                       │
│  - Dashboard with post management                                │
│  - Profile settings                                              │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 2. Authenticates via API
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  Cloudflare Worker API (complete-worker.js)                      │
│  - POST /api/v1/blog/auth/login                                  │
│  - GET /api/v1/blog/posts                                        │
│  - POST /api/v1/blog/posts (requires JWT)                        │
│  - Webhook endpoints for cache management                        │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 3. Stores data in KV
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  Cloudflare KV Storage                                           │
│  - blog:posts - All published blog posts                         │
│  - ratelimit:{ip} - Rate limiting counters                       │
│  - cache:stats - Cache hit/miss statistics                       │
└─────────────────────────────────────────────────────────────────┘
```

## Components Overview

### 1. Blog Admin Widget

**Location:** `src/widgets/_admin/blog-admin/versions/v1.0.0-blog-admin.html`

**Features:**
- Authentication: Login/logout with JWT tokens
- Post Editor: Title, excerpt, dynamic content blocks
- Dashboard: View/edit/delete posts (edit/delete placeholders)
- Profile: Display name and password change (placeholders)
- Session Management: LocalStorage persistence
- Responsive Design: Mobile-friendly interface

**Size:** ~15KB minified, self-contained (no external dependencies)

**Usage:**
```html
<!-- Squarespace Code Block -->
<div id="blog-admin-widget"></div>
<script src="https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@main/src/widgets/_admin/blog-admin/versions/v1.0.0-blog-admin.html"></script>
```

**Security:**
- Bearer token authorization
- Input sanitization (escapeHtml function)
- Secure logout with LocalStorage cleanup
- WCAG AA accessibility compliance

### 2. Cloudflare Worker API

**Location:** `tools/cloudflare/complete-worker.js`

**Endpoints:**

#### Health Check
```bash
GET /api/v1/health
```
Returns API status and timestamp.

#### Manifests
```bash
GET /api/v1/manifests          # List all manifest types
GET /api/v1/manifests/:type    # Get specific manifest
```
Serves portfolio manifests with edge caching (10 min TTL, 1 hour SWR).

#### Blog Authentication
```bash
POST /api/v1/blog/auth/login
Content-Type: application/json

{
  "username": "mccal",
  "password": "your-password"
}
```
Returns JWT token valid for 24 hours.

#### Blog Posts
```bash
# Get all posts
GET /api/v1/blog/posts

# Create new post (auth required)
POST /api/v1/blog/posts
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Post Title",
  "excerpt": "Brief description",
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

#### Webhooks (CI/CD)
```bash
POST /api/v1/webhooks/purge    # Purge cache
POST /api/v1/webhooks/warm     # Warm cache
POST /api/v1/webhooks/refresh  # Purge + warm
X-Webhook-Secret: your-secret
```

#### Cache Statistics
```bash
GET /api/v1/cache/stats
```

**Features:**
- JWT authentication with 24-hour token expiration
- Rate limiting: 100 requests/minute per IP
- CORS handling with wildcard subdomain support
- Edge caching for manifests
- KV storage for blog posts and sessions
- Comprehensive error handling

### 3. KV Storage Schema

**blog:posts** - All published blog posts
```json
{
  "posts": [
    {
      "id": "post-1733507200000",
      "title": "My First Post",
      "author": "McCal",
      "date": "2025-01-15",
      "excerpt": "Brief description",
      "body": ["Paragraph 1", "Paragraph 2"],
      "images": [
        {
          "src": "https://example.com/image.jpg",
          "alt": "Image description",
          "caption": "Optional caption"
        }
      ],
      "createdAt": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

**ratelimit:{ip}** - Rate limiting counters
```json
{
  "count": 45,
  "windowStart": 1733507200000
}
```

**cache:stats** - Cache statistics
```json
{
  "hits": 1250,
  "misses": 75,
  "lastReset": "2025-01-15T00:00:00.000Z"
}
```

## Deployment Checklist

### Prerequisites
- [x] Cloudflare account with Workers enabled
- [x] Wrangler CLI installed: `npm install -g wrangler`
- [ ] KV namespace created
- [ ] Custom domain configured (optional)

### Setup Steps

1. **Create KV Namespace**
   ```bash
   wrangler kv:namespace create "MCCAL_KV"
   ```
   Save the namespace ID from output.

2. **Configure wrangler.toml**
   ```bash
   cd tools/cloudflare
   nano wrangler.toml
   ```
   Update `kv_namespaces.id` with your namespace ID.

3. **Set Secrets**
   ```bash
   # Webhook secret
   echo "your-webhook-secret" | wrangler secret put WEBHOOK_SECRET
   
   # JWT secret
   echo "your-jwt-secret" | wrangler secret put BLOG_JWT_SECRET
   
   # Blog authors
   echo '[{"id":"mccal","username":"mccal","password":"your-password","name":"McCal"}]' | wrangler secret put BLOG_AUTHORS
   ```

4. **Deploy Worker**
   ```bash
   wrangler deploy complete-worker.js
   ```

5. **Test Endpoints**
   ```bash
   curl https://mcc-cal.com/api/v1/health
   curl https://mcc-cal.com/api/v1/manifests
   ```

6. **Update Widget**
   Update blog admin widget API_BASE to production URL:
   ```javascript
   const API_BASE = 'https://mcc-cal.com/api/v1/blog';
   ```

7. **Configure GitHub Actions**
   Add webhook secret to GitHub repository:
   ```
   Settings → Secrets → Actions → New repository secret
   Name: CLOUDFLARE_WEBHOOK_SECRET
   Value: your-webhook-secret
   ```

### Environment Variables

**Required:**
- `MCCAL_KV` - KV namespace binding
- `WEBHOOK_SECRET` - Secret for webhook authentication
- `BLOG_JWT_SECRET` - Secret for JWT token signing
- `BLOG_AUTHORS` - JSON array of author credentials

**Optional:**
- `ALLOWED_ORIGINS` - Comma-separated CORS origins (default: mcc-cal.com)
- `MANIFEST_BASE_URL` - Base URL for manifests (default: GitHub raw)

## Testing

### Local Development
```bash
# Start local worker
cd tools/cloudflare
wrangler dev complete-worker.js

# Test endpoints
curl http://localhost:8787/api/v1/health
curl http://localhost:8787/api/v1/blog/posts
```

### Test Blog Authentication
```bash
# Login
curl -X POST http://localhost:8787/api/v1/blog/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mccal","password":"your-password"}'

# Save token from response
TOKEN="<jwt-token>"

# Create post
curl -X POST http://localhost:8787/api/v1/blog/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Post",
    "excerpt":"Test excerpt",
    "content":["Paragraph 1","Paragraph 2"]
  }'

# Get posts
curl http://localhost:8787/api/v1/blog/posts
```

### Test Widget Locally

1. Open `test-blog-admin.html` in browser
2. Login with credentials from `BLOG_AUTHORS`
3. Create a test post
4. Verify post appears in dashboard

## Security Considerations

### Production Security
1. **Strong Secrets**: Use minimum 32-character random strings for JWT_SECRET and WEBHOOK_SECRET
2. **Secure Passwords**: Use strong, unique passwords for all authors
3. **HTTPS Only**: Worker only serves over HTTPS in production
4. **CORS**: Configure ALLOWED_ORIGINS to only include trusted domains
5. **Rate Limiting**: Automatically enforced (100 req/min per IP)
6. **Admin Protection**: Blog admin widget requires password protection or authentication layer

### JWT Token Security
- Tokens expire after 24 hours
- Stored in LocalStorage (consider HttpOnly cookies for enhanced security)
- Validated on every authenticated request
- Algorithm: HS256 (HMAC-SHA256)

### Best Practices
- Rotate secrets regularly
- Monitor worker logs for suspicious activity
- Use separate environments (staging/production)
- Enable 2FA on Cloudflare account
- Review KV storage permissions

## Monitoring

### View Logs
```bash
wrangler tail
```

### Check KV Storage
```bash
# List all keys
wrangler kv:key list --namespace-id=your_kv_namespace_id

# Get blog posts
wrangler kv:key get --namespace-id=your_kv_namespace_id "blog:posts"

# Get cache stats
wrangler kv:key get --namespace-id=your_kv_namespace_id "cache:stats"
```

### Cache Performance
```bash
curl https://mcc-cal.com/api/v1/cache/stats
```

### Rate Limit Status
Check response headers:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in window
- `Retry-After`: Seconds until rate limit resets (if exceeded)

## Troubleshooting

### Common Issues

**KV Not Configured Error**
- Ensure KV namespace is created
- Verify namespace ID in wrangler.toml
- Check binding name is "MCCAL_KV"

**Unauthorized Errors**
- Verify secrets are set: `wrangler secret list`
- Check JWT token is valid and not expired
- Ensure BLOG_AUTHORS JSON is valid

**CORS Errors**
- Check ALLOWED_ORIGINS includes your domain
- Verify origin format (no trailing slash)
- Test with wildcard: "*" (temporary, not for production)

**Manifest Not Found**
- Verify MANIFEST_BASE_URL is correct
- Check GitHub raw URL is accessible
- Test manifest URL in browser

**Rate Limit Exceeded**
- Wait 60 seconds for window reset
- Check if multiple clients sharing same IP
- Consider increasing RATE_LIMIT_MAX for production

## Future Enhancements

### Planned Features
- [ ] Author registration endpoint (self-service account creation)
- [ ] Post editing and deletion (currently placeholders)
- [ ] Image upload to Cloudflare R2 or S3
- [ ] Post categories and tags
- [ ] Draft/published status
- [ ] Post scheduling
- [ ] Comment system with moderation
- [ ] Analytics integration

### Optimization Opportunities
- [ ] Implement Cache API for edge caching
- [ ] Add compression for large responses
- [ ] Optimize JWT verification with caching
- [ ] Add request logging to KV
- [ ] Implement webhook retry logic

## Files Modified

### Created Files
- `tools/cloudflare/complete-worker.js` - Complete Cloudflare Worker with blog endpoints
- `tools/cloudflare/DEPLOYMENT-GUIDE.md` - Comprehensive deployment documentation
- `tools/cloudflare/wrangler.toml` - Worker configuration
- `src/widgets/_admin/blog-admin/versions/v1.0.0-blog-admin.html` - Blog admin widget
- `src/widgets/_admin/blog-admin/README.md` - Widget documentation
- `src/widgets/_admin/blog-admin/CHANGELOG.md` - Version history
- `test-blog-admin.html` - Local test page

### Updated Files
- `.env.example` - Added BLOG_AUTHORS configuration
- `.github/copilot-instructions.md` - Added blog system documentation

## Support

For issues or questions:
- Check deployment guide: `tools/cloudflare/DEPLOYMENT-GUIDE.md`
- Review worker logs: `wrangler tail`
- Check Cloudflare Workers documentation
- Contact McCal Media support

## References

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare KV Documentation](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [JWT Specification](https://jwt.io/)
