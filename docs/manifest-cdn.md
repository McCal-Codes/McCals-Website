# Manifest webhook & Cloudflare Worker integration

This document explains how to use the built-in Cloudflare Worker (`src/api/worker.js`) as the webhook endpoint for manifest generators and how to deploy and configure it.

Why use the Worker?

- Provides a public, secure endpoint for manifest generators to notify the API/edge to purge and warm caches.
- Centralizes webhook secrets (use Wrangler secrets) and can call Cloudflare purge API if desired.

Quick steps

1. Deploy the Worker with Wrangler

```bash
cd src/api
# Authenticate with Cloudflare
wrangler login

# Publish (workers_dev route)
wrangler publish
```

2. Set secrets (via Wrangler)

```bash
cd src/api
wrangler secret put WEBHOOK_SECRET          # secret expected by generator and worker
wrangler secret put ORIGIN_WEBHOOK_SECRET   # (optional) secret forwarded to origin API
wrangler secret put CLOUDFLARE_API_TOKEN    # (optional) if Worker will call Cloudflare purge
wrangler secret put ZONE_ID                 # (optional) Cloudflare zone id for purge
```

3. Configure generators to call the Worker

Set `MANIFEST_WEBHOOK_BASE` or `MANIFEST_WEBHOOK_URL` in your generator environment (CI or local). Example for worker dev URL:

```bash
export MANIFEST_WEBHOOK_BASE="https://<your-worker-subdomain>.workers.dev/api/v1/webhooks"
export WEBHOOK_SECRET="<the secret you set via wrangler>"
```

Or set `CLOUDFLARE_WORKER_SUBDOMAIN` env var and the generators will construct the URL automatically (scripts/utils/manifest-webhook.js supports this).

4. Test end-to-end

Run a generator and watch the Worker logs in Cloudflare dashboard. The generator will POST to `/refresh/:type` which triggers purge+warm logic in the Worker and/or forwards to origin.

Notes

- The repo already contains `src/api/worker.js` and `src/api/wrangler.toml`. You can reuse that and publish via `wrangler publish`.
- Keep webhook secrets out of git. Use `wrangler secret put` for Worker and your CI secret store for generators.

If you want, I can add a CI job to automatically publish the Worker and set the webhook environment variables after a successful release — ask me and I will scaffold it.

# CDN-hosted manifests (jsDelivr)

Use this flow to serve manifest JSON over CDN without running the API.

For the end-to-end source, generator, sync, CDN, and webhook map, see [Portfolio Manifest Pipeline](workflows/portfolio-manifest-pipeline.md).

## How it works

- GitHub Action `Publish Manifests to CDN` builds manifests and pushes them to branch `manifests-cdn` plus a tag (e.g., `manifests-202511241230`).
- jsDelivr can fetch tagged files directly from the repo.

## Trigger

- Automatic on pushes to `main` that touch manifests/scripts (see workflow path filters).
- Manual: GitHub → Actions → “Publish Manifests to CDN” → Run workflow (optional `tag_suffix`, defaults to timestamp).

## URLs (replace `<tag>` with the created tag)

- Concert: `https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/src/images/Portfolios/Concert/concert-manifest.json`
- Events: `https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/src/images/Portfolios/Events/events-manifest.json`
- Journalism: `https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/src/images/Portfolios/Journalism/journalism-manifest.json`
- Portrait: `https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/src/images/Portfolios/Portrait/portrait-manifest.json`
- Nature: `https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/src/images/Portfolios/Nature/nature-manifest.json`
- Featured: `https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/src/images/Portfolios/featured-manifest.json`

## Notes

- Action only commits if manifests changed.
- Branch `manifests-cdn` is force-updated each run; consume tagged URLs for stability.
- Keep images in repo so manifests stay fetchable on the runner.

## CI webhook integration

When the CDN publish workflow pushes a branch and tag, it will optionally notify your configured API webhook (if `MANIFEST_WEBHOOK_URL` or `MANIFEST_WEBHOOK_BASE` and `WEBHOOK_SECRET` are set in repository secrets). This allows your API to re-warm caches for the newly published manifests automatically.
