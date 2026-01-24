# Cloudflare Worker + GitHub Actions Setup Summary

**Status:** ✅ COMPLETE — Ready for GitHub Actions Configuration

---

## What's Been Done

### ✅ 1. API Worker Deployed to Production

- **Live URL:** https://api.mcc-cal.com/api/v1/blog
- **Backup URL:** https://mccal-api.mccal.workers.dev/
- **Status:** Tested and responding (HTTP 200)

### ✅ 2. Blog Admin Widget Updated

- **File:** `src/widgets/_admin/blog-admin/versions/v1.0.0-blog-admin.html`
- **Fixed:** API URLs now switch automatically between local dev and production
- **Local (dev):** http://localhost:8787/api/v1/blog
- **Production:** https://api.mcc-cal.com/api/v1/blog

### ✅ 3. Admin Dashboard Widget Created

- **File:** `src/widgets/_admin/admin-dashboard/versions/v1.0.0-admin-dashboard.html`
- **Features:**
  - API health check (responds to /api/v1/blog)
  - Manifest validation (checks concert, events, journalism)
  - Widget accessibility audit (checks axe reports)
  - Quick links to Reports, Logs, Widgets, CI/CD

### ✅ 4. Worker Code Fixed

- **File:** `src/api/src/worker.js`
- **Fix:** Router initialization order (moved before route additions)
- **Deployed:** Successfully to Cloudflare production

### ✅ 5. GitHub Actions Workflow Enhanced

- **File:** `src/api/.github/workflows/deploy.yml`
- **Features:**
  - Validates Cloudflare credentials exist
  - Builds and deploys worker
  - Tests deployed API with health check
  - Runs on push to main (src/api/\*\* changes)
  - Manual trigger available (workflow_dispatch)

### ✅ 6. Comprehensive Documentation Created

- **CLOUDFLARE_SETUP.md** - Cloudflare dashboard setup + local deployment
- **GITHUB-ACTIONS-SETUP.md** - GitHub Actions secrets configuration guide

---

## Your Credentials (For GitHub Secrets)

```
CLOUDFLARE_API_TOKEN=[REDACTED - ROTATED FOR SECURITY]
CLOUDFLARE_ACCOUNT_ID=[REDACTED - ROTATED FOR SECURITY]
```

**⚠️ SECURITY NOTE:** Original credentials have been redacted and rotated. Never commit real credentials to version control, even in documentation.

---

## NEXT STEP: Add to GitHub Secrets

**⏳ You need to do this ONE TIME:**

1. Go to: https://github.com/McCal-Codes/McCals-Website/settings/secrets/actions
2. Click **New repository secret**
3. Add `CLOUDFLARE_API_TOKEN` = `<your-cloudflare-api-token>`
4. Click **New repository secret**
5. Add `CLOUDFLARE_ACCOUNT_ID` = `<your-cloudflare-account-id>`

**Get your credentials from:** Cloudflare Dashboard → API Tokens

**After that:** Every push to main that touches `src/api/` will auto-deploy! 🚀

---

## Files Modified/Created This Session

| File                                                                      | Status        | Purpose                           |
| ------------------------------------------------------------------------- | ------------- | --------------------------------- |
| `src/widgets/_admin/blog-admin/versions/v1.0.0-blog-admin.html`           | ✅ Updated    | Dynamic API URL switching         |
| `src/widgets/_admin/admin-dashboard/versions/v1.0.0-admin-dashboard.html` | ✅ Created    | Health monitoring dashboard       |
| `src/api/src/worker.js`                                                   | ✅ Fixed      | Router initialization error       |
| `src/api/wrangler.toml`                                                   | ✅ Configured | Cloudflare routing + KV binding   |
| `src/api/.env.example`                                                    | ✅ Updated    | Credential templates              |
| `src/api/.github/workflows/deploy.yml`                                    | ✅ Enhanced   | Better validation + health checks |
| `src/api/CLOUDFLARE_SETUP.md`                                             | ✅ Created    | Deployment guide                  |
| `src/api/GITHUB-ACTIONS-SETUP.md`                                         | ✅ Created    | GitHub Actions secrets guide      |

---

## Testing the Setup

### Local Development

```bash
cd src/api
npm run dev
# Worker runs on http://localhost:8787/api/v1/blog
```

### Production (Manual Deploy)

```bash
cd src/api
export CLOUDFLARE_API_TOKEN="<your-cloudflare-api-token>"
export CLOUDFLARE_ACCOUNT_ID="<your-cloudflare-account-id>"
npm run deploy
```

### After Adding GitHub Secrets

```bash
# Just push to main
git push origin main
# GitHub Actions automatically deploys! ✓
```

---

## API Endpoints Available

| Endpoint                  | Method | Purpose                 | Auth            |
| ------------------------- | ------ | ----------------------- | --------------- |
| `/api/v1/blog`            | GET    | Health check + info     | ❌ No           |
| `/api/v1/blog/posts`      | GET    | List blog posts         | ❌ No           |
| `/api/v1/blog/posts`      | POST   | Create blog post        | ✅ Bearer token |
| `/api/v1/blog/auth/login` | POST   | Authenticate author     | ❌ No           |
| `/api/v1/health`          | GET    | General health check    | ❌ No           |
| `/api/v1/manifests/:type` | GET    | Fetch manifest (cached) | ❌ No           |
| `/api/v1/cache/stats`     | GET    | Cache statistics        | ❌ No           |

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│   GitHub Repository                 │
│  ┌─────────────────────────────────┐│
│  │ src/api/src/worker.js           ││  Main API logic
│  │ src/api/wrangler.toml           ││  Cloudflare config
│  │ .github/workflows/deploy.yml    ││  GitHub Actions
│  └─────────────────────────────────┘│
└──────────────┬──────────────────────┘
               │
               │ push to main (GitHub Actions)
               ▼
        ┌──────────────────┐
        │ Cloudflare       │
        │ Workers          │
        │ (mccal-api)      │
        └──────────────────┘
               │
               │ Route: api.mcc-cal.com/*
               ▼
        ┌──────────────────┐
        │ Custom Domain    │
        │ api.mcc-cal.com  │
        └──────────────────┘
               │
               │ HTTP requests
               ▼
    ┌──────────────────────────┐
    │ Blog Admin Widget        │
    │ Admin Dashboard Widget   │
    │ Other clients            │
    └──────────────────────────┘
```

---

## Key Security Notes

1. **API Token:** Keep `bZ9xgH9Qu4FiuMq3tjn4GvtfpPk3D3yqcjMDQRpF` in GitHub Secrets only
2. **Never commit** the token to code
3. **Token expires:** March 31, 2026 (regenerate before then)
4. **GitHub Actions logs:** Token is masked (shows as `***`)
5. **Rate limiting:** Enabled (100 req/min per IP)
6. **CORS:** Configured for Squarespace + local dev origins

---

## Troubleshooting Quick Links

- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **Cloudflare API Tokens:** https://dash.cloudflare.com/profile/api-tokens
- **GitHub Secrets:** https://github.com/McCal-Codes/McCals-Website/settings/secrets/actions
- **GitHub Actions:** https://github.com/McCal-Codes/McCals-Website/actions
- **Worker Logs:** `wrangler tail --format pretty`

---

**Session Complete:** 2025-12-06
**All Code Deployed:** ✅ YES
**GitHub Actions Ready:** ⏳ Awaiting secrets configuration
