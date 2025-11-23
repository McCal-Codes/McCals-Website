# API Deployment Guide: Local to Cloud

**Goal:** Run API locally now, easily migrate to cloud later  
**Strategy:** Docker everywhere (same setup, different deployment targets)

---

## Phase 1: Local Setup (Your Mac)

### Prerequisites

1. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop
   - Install and open Docker Desktop app
   - Verify: `docker --version`

### Quick Start (5 minutes)

```bash
# 1. Build the API image
docker build -f Dockerfile.api -t mccal-api .

# 2. Run as background service
docker run -d \
  --name mccal-api \
  -p 3001:3001 \
  --restart always \
  mccal-api

# 3. Test it works
curl http://localhost:3001/api/health

# 4. Check logs
docker logs mccal-api
```

### Daily Commands

```bash
# Status
docker ps

# View logs
docker logs mccal-api
docker logs -f mccal-api  # Follow logs live

# Restart
docker restart mccal-api

# Stop
docker stop mccal-api

# Start again
docker start mccal-api

# Remove completely
docker stop mccal-api
docker rm mccal-api

# Rebuild after code changes
docker build -f Dockerfile.api -t mccal-api .
docker stop mccal-api
docker rm mccal-api
docker run -d --name mccal-api -p 3001:3001 --restart always mccal-api
```

---

## Phase 2: Cloud Migration (When Ready)

### Option A: Railway.app (Recommended - Easiest)

**Why Railway:**
- ✅ Easiest to use
- ✅ Auto-detects Dockerfile
- ✅ Free $5/month credit
- ✅ Custom domains free
- ✅ Auto SSL/HTTPS
- ✅ GitHub auto-deploy

**Setup (5 minutes):**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Link to GitHub (optional but recommended)
railway link

# 5. Deploy (creates railway.toml automatically)
railway up --dockerfile Dockerfile.api

# 6. Get your URL
railway open
# You'll get: https://mccal-api.up.railway.app
```

**Or via Web Dashboard:**
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Select your repo
5. Add environment variable: `DOCKERFILE_PATH=Dockerfile.api`
6. Deploy!

**Cost:** $5/month (includes $5 free credit)

---

### Option B: Fly.io (Best Performance)

**Why Fly.io:**
- ✅ Free tier (3 VMs, 3GB storage)
- ✅ Global deployment (multi-region)
- ✅ Excellent performance
- ✅ Auto-scaling

**Setup (10 minutes):**

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth signup  # or fly auth login

# 3. Launch app (creates fly.toml)
fly launch \
  --name mccal-api \
  --dockerfile Dockerfile.api \
  --region ord \
  --no-deploy

# 4. Edit fly.toml if needed (it auto-generates)

# 5. Deploy
fly deploy

# 6. Open in browser
fly open
# You'll get: https://mccal-api.fly.dev
```

**Cost:** Free tier, then $3-5/month

---

### Option C: DigitalOcean App Platform

**Why DigitalOcean:**
- ✅ Simple, reliable
- ✅ Good documentation
- ✅ Fixed pricing
- ✅ Zero-downtime deploys

**Setup (Web Dashboard):**
1. Go to https://cloud.digitalocean.com/apps
2. Create → App
3. Connect GitHub repo
4. Select branch: `main`
5. Dockerfile path: `Dockerfile.api`
6. Set environment:
   - `API_PORT=3001`
7. Deploy!

**Cost:** $5/month (starter)

---

### Option D: Render.com

**Why Render:**
- ✅ Free tier available
- ✅ Simple as Heroku
- ✅ Auto SSL
- ✅ Easy custom domains

**Setup:**
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub
4. Select Dockerfile
5. Set Docker Build Path: `Dockerfile.api`
6. Free plan or $7/month

---

## Recommended Migration Steps

### Week 1: Local Development
```bash
# Use Docker locally
docker run -d --name mccal-api -p 3001:3001 --restart always mccal-api

# Test with widgets
# Update widget data-api="on" to test
```

### Week 2-3: Test & Refine
```bash
# Make sure everything works
# Test all manifest endpoints
# Verify widgets load from API
# Check error handling
```

### Week 4: Deploy to Railway
```bash
# Takes 5 minutes
railway up --dockerfile Dockerfile.api

# Get URL: https://mccal-api.up.railway.app
# Update CORS in server.js to include this domain
# Test from Squarespace
```

### Week 5: Point Custom Domain
```bash
# In Railway dashboard:
# Settings → Domains → Add Custom Domain
# Point mccal-api.mcc-cal.com to Railway

# Update widgets to use: https://mccal-api.mcc-cal.com
```

---

## Configuration for Production

### Update CORS for Cloud

In `src/api/server.js`, update `corsOptions`:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://mcc-cal.com',
  'https://www.mcc-cal.com',
  'https://mccal-api.up.railway.app',  // Railway
  // 'https://mccal-api.fly.dev',      // Fly.io
  /\.squarespace\.com$/,
  /\.sqsp\.com$/,
];
```

### Environment Variables (All Platforms)

Set these in your cloud dashboard:

```env
NODE_ENV=production
API_PORT=3001
CACHE_TTL_MINUTES=5
```

---

## Cost Comparison

| Platform | Free Tier | Paid | SSL | Custom Domain |
|----------|-----------|------|-----|---------------|
| Local (Docker) | ✅ Free | N/A | ❌ | ❌ |
| Railway | $5 credit/mo | $5/mo | ✅ | ✅ Free |
| Fly.io | ✅ Yes | $3-5/mo | ✅ | ✅ Free |
| DigitalOcean | ❌ | $5/mo | ✅ | ✅ Free |
| Render | ✅ Yes (limited) | $7/mo | ✅ | ✅ Free |

---

## Troubleshooting

### Docker not starting?
```bash
# Check if Docker Desktop is running
open -a Docker

# Check logs
docker logs mccal-api
```

### Port conflicts?
```bash
# See what's using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>

# Or use different port
docker run -d --name mccal-api -p 3002:3001 mccal-api
```

### Need to update code?
```bash
# Rebuild and restart
docker build -f Dockerfile.api -t mccal-api .
docker stop mccal-api && docker rm mccal-api
docker run -d --name mccal-api -p 3001:3001 --restart always mccal-api
```

---

## Next Steps

1. **Today:** Install Docker Desktop
2. **Today:** Run `docker build -f Dockerfile.api -t mccal-api .`
3. **Today:** Start API with Docker
4. **This Week:** Test thoroughly with widgets
5. **Next Week:** Deploy to Railway (5 minutes)
6. **Later:** Add custom domain

---

## Quick Reference

```bash
# Local Development
docker build -f Dockerfile.api -t mccal-api .
docker run -d --name mccal-api -p 3001:3001 --restart always mccal-api
docker logs -f mccal-api

# Railway Deployment
npm install -g @railway/cli
railway login
railway up --dockerfile Dockerfile.api

# Fly.io Deployment
fly launch --dockerfile Dockerfile.api
fly deploy

# Check API
curl http://localhost:3001/api/health
curl https://mccal-api.up.railway.app/api/health
```

---

**Status:** Ready to start with Docker locally, migrate to Railway in 5 minutes when ready.
