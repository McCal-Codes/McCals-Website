# API Development Setup Guide

This guide covers local development setup for the mccal-api when working with the McCals-Website repository.

## Quick Start

```bash
# Option 1: Automatic port management (recommended)
npm run api:setup-dev

# Option 2: Manual setup with default port
npm run api:dev

# Option 3: Start with the full dev environment (site + API + watchers)
npm run dev:full
```

## Port Management

The API development setup script automatically:

1. Kills any existing API processes
2. Finds the first available port in the range 3001-3020
3. Stores the port in `.port-lock` for reference
4. Sets up the environment variables needed

### Why Port Management?

- Local testing often encounters `EADDRINUSE` errors
- Multiple concurrent processes may need different ports
- The script prevents manual conflict resolution

## Environment Variables

The development setup automatically provides:

```bash
API_PORT=3001          # Auto-assigned (or next available)
NODE_ENV=development   # Development mode
WEBHOOK_SECRET=dev-webhook-secret-12345
BLOG_JWT_SECRET=dev-blog-secret-12345
```

**Note**: These are development defaults. For production, use Cloudflare-managed secrets.

## Dev Server Command Reference

### Start API Only (Auto Port)

```bash
npm run api:setup-dev
```

- Automatically finds available port
- Cleans up any stuck processes
- Shows port assignment in output

### Start API with Nodemon (Manual)

```bash
npm run api:dev
```

- Uses default port 3001
- Hot-reloads on file changes
- May fail if port in use

### Full Development Stack

```bash
npm run dev:full
```

Starts concurrently:

- **SITE**: Development server (localhost:3000)
- **API**: nodemon API server (localhost:3001)
- **WATCH**: Auto-manifest regeneration

Best for: Testing widgets against live API and manifest changes

### API + Site Only

```bash
npm run dev:with-api
```

Starts:

- **SITE**: Development server
- **API**: nodemon API server

Best for: Blog widget testing with live API

## Testing the API

### Health Check

```bash
curl http://localhost:3001/api/health
```

### Blog Routes

```bash
# List all blog posts
curl http://localhost:3001/api/v1/blog/posts

# Login (get JWT token)
curl -X POST http://localhost:3001/api/v1/blog/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mccal","password":"Cm03465!"}'

# Create blog post (requires JWT token)
curl -X POST http://localhost:3001/api/v1/blog/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Post",
    "excerpt": "A test post",
    "body": ["Paragraph 1", "Paragraph 2"]
  }'
```

### Manifest Routes

```bash
# List all manifests
curl http://localhost:3001/api/v1/manifests

# Get concert manifest
curl http://localhost:3001/api/v1/manifests/concert

# Get events manifest
curl http://localhost:3001/api/v1/manifests/events
```

### Webhook Routes

```bash
# Invalidate concert cache
curl -X POST http://localhost:3001/api/v1/webhooks/refresh/concert

# Invalidate all caches
curl -X POST http://localhost:3001/api/v1/webhooks/invalidate-all
```

## Testing Widgets Against Dev API

### Blog Widget Testing

```bash
# 1. Start the dev setup
npm run api:setup-dev

# 2. In another terminal, start the site
npm run dev

# 3. Visit http://localhost:3000 and find the blog widget
# 4. Test authoring: login with (mccal / Cm03465!)
# 5. Create a test post
```

The blog widget automatically uses:

- `http://localhost:3001/api/v1/blog` in development
- `/api/v1/blog` in production (same-origin)

### Concert Widget Testing

```bash
# Start full dev environment
npm run dev:full

# The concert widget will fetch from:
# http://localhost:3001/api/v1/manifests/concert
```

## Troubleshooting

### Port Already In Use

```bash
# The script handles this automatically
npm run api:setup-dev

# Or manually find and kill:
lsof -i :3001
kill -9 <PID>
```

### Routes Not Found

1. Check the API process is running: `curl http://localhost:3001/api/health`
2. Verify routes are mounted: Check `src/api/versions/v1/index.js`
3. Check logs from the API process

### Blog Widget Not Connecting

1. Verify API is running on correct port
2. Check CORS settings in `src/api/server.js` include localhost
3. Verify blog authors config exists: `src/api/config/blog-authors.json`
4. Check JWT secret is properly set

### Manifest Not Loading

1. Generate manifests first: `npm run manifest:generate`
2. Check manifest files exist: `src/images/Portfolios/*/manifest.json`
3. Verify cache isn't stale: `npm run api:refresh`

## Development Workflow

### Typical Session

```bash
# Terminal 1: Start full dev environment
npm run dev:full

# Terminal 2 (Optional): Monitor API logs
tail -f logs/api.log

# Terminal 3: Test endpoints or edit code
# The API will auto-reload with nodemon
```

### Making Changes to API

1. Edit route files in `src/api/routes/`
2. nodemon automatically restarts server
3. Test endpoints with curl or the test page
4. Check for errors in the nodemon output

### Testing Manifest Changes

1. The watcher in `dev:full` monitors image folders
2. Changes to `src/images/Portfolios/**` trigger regeneration
3. Webhook endpoints invalidate cache
4. Widgets fetch fresh manifests

## Production vs Development

| Aspect  | Development                | Production             |
| ------- | -------------------------- | ---------------------- |
| Server  | Node.js + Express          | Cloudflare Workers     |
| Port    | 3001+ (auto)               | HTTPS only             |
| Cache   | In-memory (Redis optional) | Cloudflare KV          |
| Auth    | Plaintext passwords        | bcrypt hashes          |
| CORS    | localhost allowed          | Squarespace domains    |
| Secrets | Hardcoded dev values       | GitHub Actions secrets |

## Next Steps

1. **Deploy to Cloudflare** - See `docs/integrations/api-deployment-cloudflare.md`
2. **Security Hardening** - Implement bcrypt password hashing before production
3. **JWT Secret Rotation** - Establish rotation policy for production
4. **Monitoring** - Set up Cloudflare Analytics and error tracking

## Related Documentation

- [API Deployment Guide](./api-deployment-cloudflare.md)
- [Webhook Integration](../automations/manifest-webhook-integration.md)
- [Blog Widget v0.2](../../src/widgets/blog-feed/README.md)
- [Concert Widget](../../src/widgets/concert-portfolio/README.md)
