# dev.mcc-cal.com Deployment Guide

*Last updated: December 6, 2025*

This guide covers setting up the dev.mcc-cal.com subdomain, configuring SSL/TLS, and deploying the Next.js development site.

---

## 🎯 Deployment Options

Choose one of these deployment strategies:

### Option A: Cloudflare Tunnel (Local Development)
**Best for:** Running locally while accessible at dev.mcc-cal.com
**Pros:** Free, no hosting costs, instant updates
**Cons:** Requires local machine running

### Option B: Vercel (Recommended for Production-Like Dev)
**Best for:** Production-like staging environment
**Pros:** Zero-config Next.js hosting, automatic SSL, previews
**Cons:** Some usage limits on free tier

### Option C: Cloudflare Pages
**Best for:** Integration with existing Cloudflare infrastructure
**Pros:** Fast global CDN, integrated with your domain registrar
**Cons:** Slightly more setup than Vercel

---

## 🔧 Option A: Cloudflare Tunnel (Local Dev)

### Prerequisites
- Cloudflare account with mcc-cal.com domain
- Local development environment running

### Step 1: Install Cloudflare Tunnel (cloudflared)

**macOS:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Windows:**
```powershell
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

**Linux:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared
```

### Step 2: Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This opens a browser to authorize cloudflared with your Cloudflare account.

### Step 3: Create Tunnel

```bash
# Create a tunnel named "dev-site"
cloudflared tunnel create dev-site

# Note the Tunnel ID (shown in output)
# Example: abc123-def456-ghi789
```

### Step 4: Configure DNS

Add DNS record in Cloudflare dashboard or via CLI:

**Via CLI:**
```bash
# Replace <TUNNEL-ID> with your actual tunnel ID
cloudflared tunnel route dns dev-site dev.mcc-cal.com
```

**Via Cloudflare Dashboard:**
1. Go to Cloudflare Dashboard → mcc-cal.com → DNS
2. Add CNAME record:
   - **Name:** `dev`
   - **Target:** `<TUNNEL-ID>.cfargotunnel.com`
   - **Proxy status:** Proxied (orange cloud)

### Step 5: Create Tunnel Configuration

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: <TUNNEL-ID>
credentials-file: /Users/mccal/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: dev.mcc-cal.com
    service: http://localhost:3000
  - service: http_status:404
```

### Step 6: Start Development Environment

**Terminal 1 - Start Next.js:**
```bash
cd sites/dev.mcc-cal.com
npm run dev
```

**Terminal 2 - Start Tunnel:**
```bash
cloudflared tunnel run dev-site
```

### Step 7: Access Site

Visit **https://dev.mcc-cal.com** - SSL is automatic via Cloudflare!

### Step 8: Run Tunnel as Background Service (Optional)

**macOS (launchd):**
```bash
# Install service
sudo cloudflared service install

# Start service
sudo launchctl start com.cloudflare.cloudflared
```

**Linux (systemd):**
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

## 🚀 Option B: Vercel Deployment

### Prerequisites
- GitHub repository access
- Vercel account (free tier sufficient)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy to Vercel

```bash
cd sites/dev.mcc-cal.com

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Follow prompts:
- **Project name:** dev-mcc-cal-com
- **Framework:** Next.js detected automatically
- **Build command:** `npm run build`
- **Output directory:** `.next`
- **Root directory:** `sites/dev.mcc-cal.com`

### Step 3: Configure Custom Domain

**In Vercel Dashboard:**
1. Go to Project Settings → Domains
2. Add domain: `dev.mcc-cal.com`
3. Vercel provides DNS instructions

**In Cloudflare Dashboard:**
1. Add DNS record as instructed by Vercel
2. Typically: CNAME `dev` → `cname.vercel-dns.com`
3. **Important:** Disable Cloudflare proxy (gray cloud) for initial setup
4. After SSL verification, you can re-enable proxy if desired

### Step 4: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://api.mcc-cal.com
```

### Step 5: Redeploy

```bash
vercel --prod
```

Visit **https://dev.mcc-cal.com**

---

## ☁️ Option C: Cloudflare Pages

### Step 1: Create Pages Project

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project" → "Connect to Git"
3. Select repository: `McCals-Website`
4. Configure build:
   - **Build command:** `cd sites/dev.mcc-cal.com && npm run build`
   - **Build output directory:** `sites/dev.mcc-cal.com/.next`
   - **Root directory:** `/`
   - **Framework preset:** Next.js

### Step 2: Configure Environment Variables

In Pages project settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://api.mcc-cal.com
```

### Step 3: Configure Custom Domain

1. In Pages project → Custom domains
2. Add `dev.mcc-cal.com`
3. Cloudflare automatically configures DNS (you control the domain)

### Step 4: Deploy

Push to main branch triggers automatic deployment.

---

## 🔒 SSL/TLS Configuration

### Cloudflare Tunnel
SSL is automatic - Cloudflare provides certificate.

### Vercel
SSL is automatic - Let's Encrypt certificate provisioned automatically.

### Cloudflare Pages
SSL is automatic - Cloudflare Universal SSL included.

### Verification

Check SSL configuration:
```bash
curl -I https://dev.mcc-cal.com
```

Look for:
```
HTTP/2 200
server: cloudflare (or vercel)
```

---

## 🧪 Testing & Validation

### 1. DNS Propagation

```bash
# Check DNS record
dig dev.mcc-cal.com

# Check from multiple locations
nslookup dev.mcc-cal.com 8.8.8.8
```

### 2. SSL Certificate

```bash
# Verify SSL certificate
openssl s_client -connect dev.mcc-cal.com:443 -servername dev.mcc-cal.com
```

### 3. CORS Testing

```bash
# Test API CORS headers
curl -H "Origin: https://dev.mcc-cal.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://api.mcc-cal.com/api/v1/manifests/concert
```

Should return:
```
access-control-allow-origin: https://dev.mcc-cal.com
access-control-allow-methods: GET, POST, OPTIONS
```

### 4. Site Functionality

Visit and test:
- **Homepage:** https://dev.mcc-cal.com/
- **Concerts:** https://dev.mcc-cal.com/concerts
- **API Health:** https://api.mcc-cal.com/health

---

## 🔄 CORS Configuration for Cloudflare Worker

Your Cloudflare Worker needs to allow dev.mcc-cal.com:

**In `tools/cloudflare/complete-worker.js`:**

```javascript
const ALLOWED_ORIGINS = [
  'https://mcc-cal.com',
  'https://www.mcc-cal.com',
  'https://dev.mcc-cal.com',  // ✅ Add this
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
```

**Or in `wrangler.toml`:**

```toml
[vars]
CORS_ORIGINS = "https://mcc-cal.com,https://www.mcc-cal.com,https://dev.mcc-cal.com,http://localhost:3000"
```

Then redeploy worker:
```bash
cd tools/cloudflare
wrangler deploy complete-worker.js
```

---

## 📊 Monitoring & Maintenance

### Cloudflare Tunnel Health

```bash
# Check tunnel status
cloudflared tunnel info dev-site

# View logs
cloudflared tunnel logs dev-site
```

### Vercel Logs

```bash
vercel logs
```

Or via dashboard: Project → Deployments → View logs

### Cloudflare Pages Logs

View in dashboard: Pages project → Deployments → Function Logs

---

## 🐛 Troubleshooting

### DNS Not Resolving

**Problem:** `dev.mcc-cal.com` doesn't resolve

**Solutions:**
1. Check DNS record exists in Cloudflare dashboard
2. Wait for propagation (can take 5-60 minutes)
3. Clear local DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   
   # Windows
   ipconfig /flushdns
   ```

### SSL Certificate Error

**Problem:** "Your connection is not private"

**Solutions:**
1. Wait 5-15 minutes for certificate provisioning
2. Verify DNS is correctly configured
3. Check Cloudflare SSL/TLS mode is "Full" or "Full (strict)"

### CORS Errors

**Problem:** API requests fail with CORS error

**Solutions:**
1. Add `dev.mcc-cal.com` to Worker's `ALLOWED_ORIGINS`
2. Redeploy Cloudflare Worker
3. Verify with curl test (see Testing section)
4. Check browser console for exact error message

### Cloudflare Tunnel Connection Failed

**Problem:** Tunnel won't connect

**Solutions:**
1. Check tunnel is running: `cloudflared tunnel info dev-site`
2. Verify Next.js is running on port 3000
3. Check `~/.cloudflared/config.yml` tunnel ID matches
4. Restart tunnel: `cloudflared tunnel run dev-site`

### Build Failures

**Problem:** Deployment builds fail

**Solutions:**
1. Check build locally: `npm run build`
2. Verify Node.js version matches deployment platform
3. Check environment variables are set correctly
4. Review build logs for specific errors

---

## 📝 Post-Deployment Checklist

- [ ] DNS CNAME record created and verified
- [ ] SSL/TLS certificate provisioned and valid
- [ ] CORS configured in Cloudflare Worker
- [ ] Environment variables set correctly
- [ ] Site accessible at https://dev.mcc-cal.com
- [ ] Concert portfolio loads data from API
- [ ] Images display correctly
- [ ] No console errors in browser
- [ ] Mobile responsive layout verified
- [ ] Performance acceptable (Lighthouse > 80)
- [ ] Documentation updated with deployment method

---

## 🔗 Related Documentation

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [API Integration Guide](../../docs/integrations/api-integration-guide.md)
- [Auth Setup Guide](../../docs/integrations/AUTH-SETUP-GUIDE.md)

---

## 💡 Recommendations

**For Development:** Use **Cloudflare Tunnel** (Option A)
- Free
- Instant updates as you code
- No deployment delays
- Good for rapid iteration

**For Staging/Demo:** Use **Vercel** (Option B)
- Production-like environment
- Automatic deployments on git push
- Branch previews
- Good for showing clients/testing

**For Production Dev:** Use **Cloudflare Pages** (Option C)
- Integrated with your Cloudflare setup
- Global CDN performance
- Unified billing/management
- Good for long-term staging site

---

*Need help? See [troubleshooting section](#-troubleshooting) or check related docs.*
