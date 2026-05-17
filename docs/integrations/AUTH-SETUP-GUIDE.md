# Authentication Setup Guide

This guide covers generating and managing authentication tokens for the Blog Admin Widget and Cloudflare Worker integration.

---

## Overview

The blog system uses JWT (JSON Web Tokens) for authentication with the following flow:

1. **Admin logs in** via Blog Admin Widget with username/password
2. **Cloudflare Worker validates** credentials against BLOG_AUTHORS environment variable
3. **Worker issues JWT token** (HS256 signed, 24-hour expiry)
4. **Admin uses Bearer token** for creating/editing posts
5. **Widget persists token** in localStorage for session management

---

## Environment Variables Setup

### 1. Create or Update `.env` File

Copy `.env.example` and populate with real values:

```bash
cp .env.example .env
```

### 2. JWT_SECRET (Token Signing Key)

Generate a strong random secret for signing JWT tokens:

**On macOS/Linux:**
```bash
# Using OpenSSL
openssl rand -hex 32
# Output: a3b8c9d2e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5

# Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**On Windows (PowerShell):**
```powershell
# Using .NET
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Add to `.env`:
```bash
JWT_SECRET=<generated-jwt-secret>
```

### 3. WEBHOOK_SECRET (Webhook Verification)

Generate a separate secret for webhook authentication (same process as JWT_SECRET):

```bash
# Using OpenSSL
openssl rand -hex 32
# Output: <generated-webhook-secret>

# Or reuse the method above with node/python
```

Add to `.env`:
```bash
WEBHOOK_SECRET=<generated-webhook-secret>
```

### 4. BLOG_AUTHORS (Author Credentials)

This environment variable holds author credentials as a JSON array. Format:

```json
[
  {
    "id": "author-1",
    "username": "mccal",
    "password": "secure-password-here",
    "name": "McCal"
  },
  {
    "id": "author-2",
    "username": "contributor",
    "password": "another-secure-password",
    "name": "Contributor Name"
  }
]
```

**Important Security Notes:**
- Use **strong, unique passwords** for each author
- **Do NOT commit `.env`** to version control (already in `.gitignore`)
- Passwords are stored in plain text in the environment (acceptable for small teams; consider hashing for scale)
- Consider using a password manager to generate passwords

**Add to `.env` (single line, proper JSON escaping):**

```bash
BLOG_AUTHORS=[{"id":"author-1","username":"mccal","password":"your-secure-password-here","name":"McCal"}]
```

Or for multiple authors:

```bash
BLOG_AUTHORS=[{"id":"author-1","username":"mccal","password":"password1","name":"McCal"},{"id":"author-2","username":"contributor","password":"password2","name":"Contributor"}]
```

### 5. MANIFEST_BASE_URL (Worker Endpoint)

This is the base URL where your Cloudflare Worker is deployed:

**Local development (dev proxy):**
```bash
MANIFEST_BASE_URL=http://localhost:3000
```

**Production (Cloudflare Worker):**
```bash
MANIFEST_BASE_URL=https://your-worker-url.workers.dev
```

Get your Worker URL after deployment:
```bash
wrangler deploy complete-worker.js
# Output will show: https://complete-worker.<account-name>.workers.dev
```

### 6. CORS_ORIGINS (Allowed Origins)

Controls which domains can call your Worker endpoints:

```bash
# Local development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173

# Production (add both Squarespace domain and any other frontends)
CORS_ORIGINS=https://mccal.com,https://*.mccal.com,http://localhost:3000
```

---

## Local Development Setup

### Step 1: Generate Secrets

```bash
# Terminal session
JWT_SECRET=$(openssl rand -hex 32)
WEBHOOK_SECRET=$(openssl rand -hex 32)

# Output for copying:
echo "JWT_SECRET=$JWT_SECRET"
echo "WEBHOOK_SECRET=$WEBHOOK_SECRET"
```

### Step 2: Create `.env` File

```bash
cat > .env << 'EOF'
JWT_SECRET=YOUR_JWT_SECRET_HERE
WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE
BLOG_AUTHORS=[{"id":"author-1","username":"mccal","password":"test-password","name":"McCal"}]
MANIFEST_BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
EOF
```

### Step 3: Start Dev Server

```bash
npm run dev
# Opens http://localhost:3000
```

### Step 4: Test Blog Admin Widget

Visit `/test-blog-admin.html`:

```
http://localhost:3000/test-blog-admin.html
```

**Login credentials (from BLOG_AUTHORS):**
- Username: `mccal`
- Password: `test-password`

---

## Production Deployment

### Step 1: Create Production `.env`

In your Cloudflare account/CI/CD system, set environment variables:

| Variable | Value | Example |
|----------|-------|---------|
| JWT_SECRET | Strong random hex string (32+ chars) | `openssl rand -hex 32` |
| WEBHOOK_SECRET | Strong random hex string (32+ chars) | `openssl rand -hex 32` |
| BLOG_AUTHORS | JSON array of author objects | See format above |
| MANIFEST_BASE_URL | Your Worker URL | `https://my-worker.workers.dev` |
| CORS_ORIGINS | Your domain + dev URLs | `https://mccal.com,http://localhost:3000` |

### Step 2: Deploy Worker

```bash
# Install wrangler globally
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create "MCCAL_KV"

# Deploy worker
cd tools/cloudflare
wrangler deploy complete-worker.js

# Output: https://complete-worker.<account>.workers.dev
```

### Step 3: Set Environment Variables in Cloudflare Dashboard

1. Go to **Cloudflare Dashboard** → **Workers** → **Settings**
2. Under **Environment Variables**, add:
   - `JWT_SECRET` = [generated secret]
   - `WEBHOOK_SECRET` = [generated secret]
   - `BLOG_AUTHORS` = [JSON array]
   - `MANIFEST_BASE_URL` = [worker URL]
   - `CORS_ORIGINS` = [your domain]

### Step 4: Bind KV Namespace

In `wrangler.toml`:

```toml
[[env.production.kv_namespaces]]
binding = "MCCAL_KV"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_KV_NAMESPACE_PREVIEW_ID"
```

Get your namespace ID:
```bash
wrangler kv:namespace list
```

### Step 5: Test Production Endpoints

```bash
# Replace with your worker URL
WORKER_URL="https://complete-worker.YOUR-ACCOUNT.workers.dev"

# Test manifest endpoint
curl "$WORKER_URL/api/v1/manifests/concert"

# Test login
curl -X POST "$WORKER_URL/api/v1/blog/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"mccal","password":"test-password"}'

# Test posts (with token from login response)
curl "$WORKER_URL/api/v1/blog/posts" \
  -H "Authorization: Bearer <jwt-token>"
```

---

## Token Generation & Rotation

### Manual Token Generation

For testing or admin access without the widget UI:

```bash
# Using Node.js
node -e "
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
const payload = {
  id: 'author-1',
  username: 'mccal',
  name: 'McCal'
};

const token = jwt.sign(payload, secret, { expiresIn: '24h' });
console.log('Token:', token);
"
```

Or use the Worker's login endpoint:

```bash
curl -X POST "http://localhost:3000/api/v1/blog/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mccal",
    "password": "test-password"
  }' | jq '.token'
```

### Token Expiry & Refresh

- **Expiry**: 24 hours from issuance
- **Refresh**: Login again to get a new token
- **Persistence**: Widget stores token in localStorage (automatically reused for 24 hours)

### Rotating Secrets

To rotate JWT_SECRET (invalidates all existing tokens):

1. Update `.env` with new JWT_SECRET
2. Redeploy Worker: `wrangler deploy`
3. All users must login again
4. Store old secret in environment for grace period (optional)

---

## Security Best Practices

1. **Generate Strong Secrets**
   - Use `openssl rand -hex 32` or equivalent
   - Minimum 32 bytes (64 hex characters)
   - Never reuse across projects

2. **Never Commit Secrets**
   - `.env` is in `.gitignore`
   - Use environment variables in CI/CD
   - Store secrets in secure vault (GitHub Secrets, Cloudflare KV, etc.)

3. **Use HTTPS in Production**
   - Cloudflare Workers automatically use HTTPS
   - Ensure widget iframe is loaded via HTTPS

4. **Limit CORS Origins**
   - Only allow your domain(s) to access endpoints
   - Avoid wildcard origins in production (`*`)

5. **Monitor Token Usage**
   - Check Worker Analytics for auth endpoint calls
   - Monitor failed login attempts via KV rate limiting

6. **Rotate Credentials Regularly**
   - Change BLOG_AUTHORS passwords quarterly
   - Rotate JWT_SECRET annually
   - Keep audit log of changes

---

## Troubleshooting

### "Invalid Credentials" on Login

**Problem:** Login fails with invalid credentials error

**Solutions:**
1. Verify BLOG_AUTHORS JSON is valid (use `echo $BLOG_AUTHORS | jq .`)
2. Check password matches exactly (case-sensitive)
3. Ensure BLOG_AUTHORS environment variable is set in Worker settings
4. Restart worker: `wrangler deploy`

### "Token Expired" After 24 Hours

**Expected behavior** — JWT tokens expire after 24 hours

**Solution:** Click "Logout" and login again to get new token

### Worker Not Responding

**Problem:** API endpoints return 502 or timeout

**Solutions:**
1. Check Worker is deployed: `wrangler deployments list`
2. Check KV namespace is bound: `wrangler kv:namespace list`
3. Check environment variables set: Cloudflare Dashboard → Workers → Settings
4. Review Worker logs: `wrangler tail`

### CORS Error When Testing

**Problem:** `Access-Control-Allow-Origin` header missing

**Solutions:**
1. Verify CORS_ORIGINS environment variable set
2. Check request origin matches CORS_ORIGINS
3. Ensure request includes Origin header: `curl -H "Origin: http://localhost:3000" ...`

---

## Reference

- **JWT Standard**: https://jwt.io
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Environment Variables in Cloudflare**: https://developers.cloudflare.com/workers/configuration/environment-variables/
- **KV Storage**: https://developers.cloudflare.com/workers/runtime-apis/kv/
