# Manifest Webhook Proxy (Cloudflare Worker)

A minimal Worker that forwards manifest refresh webhooks to your API and falls back to GitHub raw manifests if the origin is unavailable.

## Worker code (drop-in)
```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/api\/v1\/webhooks\/refresh\/([^/]+)$/);
    if (!m) return new Response('Not Found', { status: 404 });

    const type = m[1];
    const secret = request.headers.get('x-webhook-secret');
    if (!secret || secret !== env.WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Invalid webhook secret' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    const body = await request.text();
    const originUrl = `${env.ORIGIN_BASE.replace(/\/+$/, '')}/api/v1/webhooks/refresh/${type}`;

    let originResp = null;
    try {
      originResp = await fetch(originUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-webhook-secret': env.WEBHOOK_SECRET },
        body: body || '{}',
      });
    } catch (_) {}

    if (originResp && originResp.ok) {
      const res = new Response(originResp.body, originResp);
      res.headers.set('cache-control', 'public, max-age=300, stale-while-revalidate=600');
      return res;
    }

    const fbUrl = `${env.FALLBACK_BASE.replace(/\/+$/, '')}/src/images/Portfolios/${type}/${type}-manifest.json`;
    let fbResp = null;
    try { fbResp = await fetch(fbUrl); } catch (_) {}
    if (fbResp && fbResp.ok) {
      const res = new Response(fbResp.body, fbResp);
      res.headers.set('x-fallback', 'github');
      res.headers.set('cache-control', 'public, max-age=600, stale-while-revalidate=1800');
      return res;
    }

    return new Response(JSON.stringify({ error: 'Unavailable', origin: originResp ? originResp.status : 'no-response' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  },
};
```

## Required environment variables
Set these in the Cloudflare dashboard or `wrangler.toml`:
- `WEBHOOK_SECRET` — shared secret expected from manifest generators.
- `ORIGIN_BASE` — e.g., `https://api.yourdomain.com` (your API that handles `/api/v1/webhooks/refresh/{type}`).
- `FALLBACK_BASE` — e.g., `https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main` (or a jsDelivr CDN URL if preferred).

## Suggested `wrangler.toml`
```toml
name = "manifest-webhook-proxy"
main = "index.js"
compatibility_date = "2024-09-01"
```

Deploy:
```sh
npx wrangler deploy
```

## Wire manifest generators/watchers
Set these where you run manifest scripts or watchers:
```dotenv
WEBHOOK_SECRET=your-secret
MANIFEST_WEBHOOK_BASE=https://your-worker.example.com/api/v1/webhooks
# or
MANIFEST_WEBHOOK_URL=https://your-worker.example.com/api/v1/webhooks/refresh/{type}
```

Local dev: disable webhook noise with `MANIFEST_WEBHOOK_DISABLED=true`.

## File location
A copy of this Worker is also stored at `tools/cloudflare/manifest-webhook-worker.js` for quick deployment via Wrangler.
