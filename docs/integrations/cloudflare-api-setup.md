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
ALLOWED_ORIGINS=https://mccalmedia.com,https://*.squarespace.com
JWT_SECRET=***
WEBHOOK_SECRET=***
PORT=3001
REDIS_URL=redis://localhost:6379
```

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
