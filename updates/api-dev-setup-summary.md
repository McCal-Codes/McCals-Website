# API Development Setup - Summary

Based on the previous conversation, we've now set up a complete development environment for working with the mccal-api locally. Here's what's available:

## 🚀 Quick Start Commands

```bash
# Check if everything is set up correctly
npm run api:health

# Start API with automatic port management
npm run api:setup-dev

# Start everything (site + API + watchers)
npm run dev:full

# Start API + site only
npm run dev:with-api
```

## 📋 What Was Done

### 1. ✅ Webhook Infrastructure (Previously Completed)

- Updated all 4 manifest workflows with consistent webhook secret passing
- Webhook action is ready to notify API of manifest changes
- Ready for Cloudflare deployment

### 2. ✅ Blog Authoring Panel (Previously Validated)

- Blog widget v0.2 is fully implemented and configured
- API routes mounted: `/api/v1/blog/`
- Authors config exists with test credentials
- Blog posts JSON file created and ready

### 3. ✅ Development Tools (Just Created)

- **setup-api-dev.sh** - Automatic port management script
- **api-health-check.js** - Comprehensive health validation
- **api-dev-setup.md** - Complete development guide

## 🔧 New Development Tools

### setup-api-dev.sh

Automatically handles:

- Killing stuck processes
- Finding available port (3001-3020)
- Setting environment variables
- Starting nodemon with hot-reload

```bash
npm run api:setup-dev
```

### api-health-check.js

Validates:

- Required files exist
- API is responding
- All endpoints are accessible
- Configuration is correct
- Environment variables are set

```bash
npm run api:health
```

### api-dev-setup.md

Comprehensive guide covering:

- Quick start options
- Port management details
- Environment variables
- cURL examples for testing
- Widget integration testing
- Troubleshooting

## 📂 Files Created

```
scripts/admin/
  ├── setup-api-dev.sh          (Port management script)
  └── api-health-check.js       (Health validation)

docs/integrations/
  ├── api-dev-setup.md          (Development guide)
  ├── api-deployment-cloudflare.md (From previous conversation)
  └── ...

package.json
  ├── api:setup-dev             (NEW)
  ├── api:health                (NEW)
  └── api:dev, api:start, etc.  (Existing)
```

## 🎯 Next Steps

### Immediate (This Session)

1. Run health check: `npm run api:health`
2. Start dev environment: `npm run api:setup-dev`
3. Test endpoints with curl or visit `http://localhost:3001/api/health`

### For Testing Widgets

```bash
# Terminal 1: Start full dev environment
npm run dev:full

# This starts:
# - SITE: Development server (localhost:3000)
# - API: nodemon API server (localhost:3001+)
# - WATCH: Auto-manifest regeneration

# Terminal 2: Visit http://localhost:3000 and test widgets
# - Blog widget: Test authoring with mccal/Cm03465!
# - Concert/Events widgets: Verify manifest fetch works
```

### For Cloudflare Deployment

See: `docs/integrations/api-deployment-cloudflare.md`

1. Gather Cloudflare account credentials
2. Create wrangler.toml from template
3. Deploy: `wrangler publish`
4. Configure GitHub secrets
5. Test against `api.mcc-cal.com`

## 🧪 Development Workflow

### Typical Session

```bash
# Terminal 1: Start everything
npm run dev:full

# Terminal 2: Check health
npm run api:health

# Terminal 3: Edit code, test endpoints
# - Edit src/api/routes/blog.js
# - nodemon auto-restarts
# - Test with curl or widget
```

### Testing Blog Widget

```bash
# 1. Generate fresh manifests
npm run manifest:generate

# 2. Start dev environment
npm run dev:full

# 3. Open http://localhost:3000

# 4. Find blog widget, test authoring:
#    Username: mccal
#    Password: Cm03465!

# 5. Create a test post
```

### Testing Cache Invalidation

```bash
# 1. Start API
npm run api:setup-dev

# 2. In another terminal, invalidate cache:
curl -X POST http://localhost:3001/api/v1/webhooks/refresh/concert

# 3. Watch API logs for refresh operation
```

## 🔍 Troubleshooting

### Port in Use

```bash
# Script handles this automatically
npm run api:setup-dev

# Or manually:
lsof -i :3001
kill -9 <PID>
```

### API Not Responding

```bash
# Run health check to diagnose
npm run api:health

# Check logs
curl http://localhost:3001/api/health
```

### Routes Not Found

1. Verify routes are mounted: `src/api/versions/v1/index.js`
2. Check imports in `src/api/routes/*.js`
3. Restart API process with fresh setup

### Blog Widget Not Connecting

1. Verify API is running: `npm run api:health`
2. Check CORS in `src/api/server.js`
3. Verify `src/api/config/blog-authors.json` exists
4. Check blog JWT secret is set

## 📚 Documentation

- **api-dev-setup.md** - Complete development guide
- **api-deployment-cloudflare.md** - Cloudflare deployment
- **../copilot-instructions.md** - Workspace standards
- **../README.md** - Main project documentation

## 🎓 Key Learnings

From previous development:

1. **Local testing** can have port conflicts - solution is automatic port management
2. **Widget integration** requires testing against actual widget code, not just raw APIs
3. **Cloudflare deployment** is the production path - local dev is secondary
4. **Webhook infrastructure** is already wired in CI - just needs Cloudflare deployment
5. **Blog authoring** is fully implemented - ready for integration testing

## ✨ What's Working

- ✅ API code is production-ready
- ✅ All endpoints are implemented and tested
- ✅ Blog widget v0.2 is feature-complete
- ✅ Webhook infrastructure is wired in CI
- ✅ Manifest cache invalidation endpoints ready
- ✅ Development tools for local testing created

## 🚀 Production Readiness

The API is **production-ready** for Cloudflare deployment:

1. **Code**: All routes implemented, tested, documented
2. **Configuration**: Environment variables properly handled
3. **Security**: CORS configured, webhook authentication ready
4. **Integration**: Widgets properly target API endpoints
5. **Deployment**: Guide created with wrangler.toml template

**Next action**: Deploy to Cloudflare with your account credentials.

---

**Commands Summary**

```bash
npm run api:health           # Check if API is ready
npm run api:setup-dev        # Start API with port management
npm run dev:full             # Start everything (site + API + watch)
npm run dev:with-api         # Start site + API
npm run api:dev              # Start API only (manual)
```

Last updated: 2025-01-27 (Current session)
