// Cloudflare Worker: Manifest webhook forwarder with GitHub fallback
// Deploy with: npx wrangler deploy tools/cloudflare/manifest-webhook-worker.js
// Required env vars (set in Dashboard or wrangler.toml):
// - WEBHOOK_SECRET: shared secret expected from manifest generators
// - ORIGIN_BASE: e.g., https://api.yourdomain.com
// - FALLBACK_BASE: e.g., https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/v1\/webhooks\/refresh\/([^/]+)$/);
    if (!match) return new Response('Not Found', { status: 404 });

    const type = match[1];
    const secret = request.headers.get('x-webhook-secret');
    if (!secret || secret !== env.WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Invalid webhook secret' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      });
    }

    const body = await request.text();
    const originUrl = `${env.ORIGIN_BASE.replace(/\/+$/, '')}/api/v1/webhooks/refresh/${type}`;
    let originResp = null;
    try {
      originResp = await fetch(originUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-webhook-secret': env.WEBHOOK_SECRET },
        body: body || '{}'
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
      headers: { 'content-type': 'application/json' }
    });
  }
};
