# CDN-hosted manifests (jsDelivr)

Use this flow to serve manifest JSON over CDN without running the API.

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
