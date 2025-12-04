# Cloudflare API Setup for `api.mcc-cal.com`

This guide summarizes how to host your private API on Cloudflare and consume it from Squarespace widgets.

## Options

- Workers (recommended): serverless API with routes `api.mcc-cal.com/*`.
- Pages Functions: filesystem routing under `functions/` with a Pages project.
- Tunnel to origin: expose your Docker API via Cloudflare Tunnel.

## DNS & SSL

- Add `mcc-cal.com` to Cloudflare, change nameservers.
- Create `api.mcc-cal.com`:
  - Workers: Route → `api.mcc-cal.com/*`.
  - Pages: Custom Domain → `api.mcc-cal.com`.
- SSL/TLS: Full (Strict).

## CORS & Auth

- Allow `ALLOWED_ORIGINS`: your site + Squarespace preview domains.
- Preflight: handle `OPTIONS`.
- Headers: `Content-Type`, `Authorization`, `X-API-Key`.
- Cache: send `ETag` and `Cache-Control` for GET; respect conditional requests.

## Secrets & Env

- Workers: `wrangler.toml` vars; `wrangler secret put` for sensitive values.
- Pages: Project → Environment Variables.
- Example env:

```
API_PORT=3011
ALLOWED_ORIGINS=https://mccalmedia.com,https://*.squarespace.com
JWT_SECRET=***
WEBHOOK_SECRET=***
REDIS_URL=redis://localhost:6379
```

**Note**: Your `server.js` reads `API_PORT` (not `PORT`); use `API_PORT` when starting the Express API locally.

## Dev Server

### Cloudflare Worker local dev

Install wrangler locally (already done in the API submodule):

```zsh
# From the API repo (src/api submodule)
npm install --save-dev wrangler
```

Run dev server (default port 8787):

```zsh
# Local mode (no remote bindings)
npm run cf:dev
# or manually:
npx wrangler dev --local --port 8787
```

Test the health endpoint:

```zsh
curl -I http://127.0.0.1:8787/api/v1/health
curl http://127.0.0.1:8787/api/v1/manifests
```

Remote dev mode (connects to your Cloudflare account for live KV/DO/etc.):

```zsh
npm run cf:dev:remote
# or manually:
npx wrangler dev --port 8787
```

**Scripts in `package.json`**:

- `npm run cf:dev`: Local dev server (no network bindings)
- `npm run cf:dev:remote`: Remote dev with live Cloudflare bindings
- `npm run cf:deploy`: Deploy to production (requires `CLOUDFLARE_API_TOKEN` or `wrangler login`)
- `npm run cf:tail`: Stream production logs (`wrangler tail`)

### Express API local dev

To run the Node/Express backend separately:

```zsh
# From src/api submodule
API_PORT=3011 NODE_ENV=development npm run dev
# or directly:
API_PORT=3011 NODE_ENV=development node server.js
```

Health check for Express:

```zsh
curl -I http://localhost:3011/api/health
curl -I http://localhost:3011/api/v1/health
```

### Dual mode (optional)

If you want to test both servers locally:

- Run Express on `API_PORT=3011` (for local backend dev)
- Run Cloudflare Worker dev on `8787` (for Worker routing and CORS testing)
- Your site dev server can proxy `/api/*` to either port for integration tests

## CI/CD (API repo)

- Create Cloudflare API token (least privilege: Workers/Pages Deploy).
- Store as `CLOUDFLARE_API_TOKEN` in repo secrets.
- Deploy on push to main.

## Site repo CI (submodules)

- Use `actions/checkout@v4` with `submodules: true`.
- Authenticate with `secrets.PRIVATE_REPO_PAT` or `secrets.SUBMODULE_SSH_KEY`.

## Verification

- Confirm DNS & SSL for `api.mcc-cal.com`.
- Health endpoint responds with CORS headers.
- Widgets can call public endpoints and get cache hits.
