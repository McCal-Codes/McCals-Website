# Manifest Scripts

Scripts for generating and managing portfolio manifests. Used for image indexing and manifest rollups.

## Nature Manifest Auto-Generation

**Script:** `generate-nature-manifest.js`

- Scans all animal types under `src/images/Portfolios/Nature/Wildlife/*` (e.g., Birds, Mammals, Reptiles, etc.), and landscape/location folders under `src/images/Portfolios/Nature/Landscapes/*`.
- For each animal type, scans all species folders, auto-generates/updates a `manifest.json` in each with correct filenames, tags (animal type), and metadata.
- Aggregates all collections into a single `nature-manifest.json` for portfolio widgets.
- Whenever you add a new animal type, species, or landscape/location folder (with images), just run:

```sh
node scripts/manifest/generate-nature-manifest.js
```

This will auto-populate all manifests and keep the portfolio up to date, just like the concert manifest workflow.

## Automatic webhook notification (CI + local)

Manifest generators and CI workflows can automatically notify the API webhook to refresh caches when a manifest is written.
This is off by default for local runs — enable it by setting environment variables when running the generators, or configure repository secrets for CI workflows.

Manifest generators can automatically notify the API webhook to refresh caches when a manifest is written. This is off by default — enable it by setting environment variables when running the generators:

### Environment variables (local)

- MANIFEST_WEBHOOK_BASE — base URL for the webhook endpoint (default: http://localhost:3001/api/v1/webhooks). The generator will POST to `${MANIFEST_WEBHOOK_BASE}/refresh/<type>` if a manifest updates.
- MANIFEST_WEBHOOK_URL — optional full URL; if provided, the generator will use this exact URL instead of building the refresh path (you can include the `{type}` placeholder but the current generator just appends `/refresh/<type>` when needed).
- WEBHOOK_SECRET — used as the `x-webhook-secret` header when calling the API (must match the API's expected secret to authenticate the request).
- MANIFEST_WEBHOOK_ALWAYS — when set to `true` the generator will POST to the webhook even if no file was changed (useful for testing or forcing re-warm).

### Repository secrets (CI)

CI workflows will use repository secrets to notify the API in a safe, centralized way. Add the following secrets to your repository (Settings → Secrets & variables → Actions):

- `MANIFEST_WEBHOOK_URL` — (optional) an explicit webhook URL used by CI (overrides MANIFEST_WEBHOOK_BASE). Example: `https://api.example.com/api/v1/webhooks/refresh/<type>`.
- `MANIFEST_WEBHOOK_BASE` — (optional) webhook base URL; CI will POST to `${MANIFEST_WEBHOOK_BASE}/refresh/<type>` for each manifest type if MANIFEST_WEBHOOK_URL is not set.
- `WEBHOOK_SECRET` — (recommended) secret string used for `x-webhook-secret` header so your API can validate requests from CI.

If none of the webhook secrets are configured, CI will keep running the generation and commit steps but will skip the notification (the workflow composite action is defensive and skips notification when configuration is absent).

### How CI uses it (what we changed)

- All manifest workflows now use a single composite action at `/.github/actions/notify-manifest-webhook` to reduce duplication and centralize behavior.
- The composite action will use job-level environment secrets (when present) and will POST a small JSON a payload `{ type, source: 'ci', ref }` so the API can re-warm caches.

### Example - local test

Run a generator locally and notify the API running on localhost:

```bash
MANIFEST_WEBHOOK_BASE=http://localhost:3001/api/v1/webhooks \ 
WEBHOOK_SECRET=change-me \ 
node scripts/manifest/generate-concert-manifest.js
```

You should see the generator write the manifest (when changed) and a short log line showing the webhook notification. In CI the notification is handled via the composite action, so there is no duplication across workflows.

Usage example (local):

```bash
MANIFEST_WEBHOOK_BASE=http://localhost:3001/api/v1/webhooks WEBHOOK_SECRET=change-me node scripts/manifest/generate-concert-manifest.js
```

This is safe and idempotent — the API will accept the refresh request and re-warm cache only when appropriate.
